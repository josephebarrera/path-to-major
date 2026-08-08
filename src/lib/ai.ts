"use server";

import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { formatMajors } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

type Analysis = {
  summary: string;
  skills: string[];
  relevance: string;
  relevance_score: number | null;
  suggestions: string[];
  related: string[];
  needs_more_detail: boolean;
};

type Recommendation = {
  title: string;
  why: string;
  category: string;
  effort: "low" | "medium" | "high";
};

const NOT_CONFIGURED_SUMMARY =
  "AI feedback isn't turned on yet for this app. Add an LLM API key and wire it into callAI() in src/lib/ai.ts to enable personalized analysis.";

// Pinned (not the "gemini-flash-latest"/"gemini-flash-lite-latest" aliases):
// the "latest" alias for the full Flash model silently rolled onto
// gemini-3.6-flash mid-project, which turned out to have a much stricter
// free-tier quota (20 requests/day, project-wide) than whatever it resolved
// to before — an unannounced regression, not a deliberate choice.
//
// Flash-Lite instead of full Flash: it's a separate free-tier quota pool
// from the (now exhausted) full Flash model, with a substantially higher
// daily request ceiling — worth the small capability trade for this app's
// job (structured JSON + short counselor-style reasoning), especially
// combined with the tightened prompts and lower temperature already in use.
//
// A pinned ID will eventually 404 as Google deprecates it (this has already
// happened once this project, to gemini-2.5-flash), which needs a manual
// bump — but that's a predictable, occasional maintenance task, unlike a
// quota cliff with no warning. Bump this if it starts 404ing.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

// Per-user cap on Gemini calls per day, enforced server-side via the
// increment_ai_usage() function so it can't be bypassed by hammering the
// "Re-analyze" or "Refresh" buttons.
const DAILY_AI_LIMIT = 30;

async function enforceDailyLimit(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("increment_ai_usage");
  if (error) {
    throw new Error("Couldn't verify your AI usage limit. Please try again.");
  }
  if (typeof data === "number" && data > DAILY_AI_LIMIT) {
    throw new Error(
      `You've reached today's AI limit (${DAILY_AI_LIMIT} requests). Try again tomorrow.`,
    );
  }
}

/**
 * Calls the Google Gemini API with JSON output mode. Returns {} when no API
 * key is configured so callers fall back to honest "not configured" copy
 * instead of fake AI-sounding text.
 */
async function callAI(
  system: string,
  user: string,
  // Lower than the API default (~1.0) so the model reliably follows the
  // instructions in the prompt (grounding recommendations in the actual
  // major, judging description sufficiency consistently) instead of
  // occasionally sampling a different answer to the same input. 0.4 is the
  // shared default; callers with a more classification-like judgment (e.g.
  // analyzeActivity's insufficient-detail check, which was flip-flopping on
  // identical input at 0.4) pass something lower.
  temperature = 0.4,
): Promise<Record<string, unknown>> {
  if (!env.GEMINI_API_KEY) return {};

  await enforceDailyLimit();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature,
          // Gemini 3.x models run an internal "thinking" reasoning pass by
          // default before answering — measured at ~238s for this model on
          // a trivial prompt, which is why re-analyze felt like it hung.
          // LOW brings that down to ~2s with no loss of output quality in
          // testing (structured JSON scoring doesn't need deep reasoning).
          // Note: thinkingLevel (not the older thinkingBudget) is the right
          // knob for Gemini 3+ models specifically.
          thinkingConfig: { thinkingLevel: "LOW" },
        },
      }),
    },
  );

  if (!res.ok) {
    // Log the real provider error server-side for debugging, but never pass
    // it up to the client — it's raw JSON/HTTP detail from Gemini (status
    // codes, quota/billing URLs, etc.) that isn't meaningful to a student
    // and shouldn't be exposed as app-facing text.
    const detail = await res.text().catch(() => "");
    console.error(`Gemini API error (${res.status}): ${detail.slice(0, 500)}`);
    if (res.status === 429) {
      throw new Error(
        "AI is handling a lot of requests right now. Please try again in a minute.",
      );
    }
    throw new Error(
      "AI feedback is temporarily unavailable. Please try again later.",
    );
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("Gemini API returned an empty response body");
    throw new Error(
      "AI feedback is temporarily unavailable. Please try again later.",
    );
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    console.error(`Gemini API returned unparseable JSON: ${text.slice(0, 500)}`);
    throw new Error(
      "AI feedback is temporarily unavailable. Please try again later.",
    );
  }
}

export async function analyzeActivity(activityId: string): Promise<Analysis> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: activity, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !activity) throw new Error("Activity not found");

  const { data: profile } = await supabase
    .from("profiles")
    .select("intended_majors, grade_level")
    .eq("id", user.id)
    .maybeSingle();

  const major =
    formatMajors(profile?.intended_majors ?? []) || "an undecided major";
  const grade = profile?.grade_level
    ? `grade ${profile.grade_level}`
    : "high school";

  const system =
    "You are a supportive but rigorous college counselor for high school students. You give warm, specific, and actionable feedback about how a student's extracurricular activity connects to their intended college major, but you never invent depth, skills, or accomplishments the student didn't actually describe.\n\n" +
    "Base every judgment strictly on the concrete details in the activity's description, leadership role, and student-listed skills — not on the activity's category or name alone, and not on any assumption about how much time the student has put into it (you aren't told that, so don't guess).\n\n" +
    "First decide if there's enough concrete detail to assess this honestly. Treat it as insufficient when the description is missing, just restates the activity name (e.g. \"write music\" for an activity called \"Artist\"), or gives no specifics on what the student actually did, how often, or what they produced or learned. When it's insufficient: set needs_more_detail to true, leave relevance_score as null and skills/suggestions/related as empty arrays, and make summary a short, kind, specific ask for the detail that would let you score it fairly (e.g. what they actually create or work on, how often, any concrete projects or outcomes) — never fabricate any of those fields to paper over the gap.\n\n" +
    "When there IS enough detail, set needs_more_detail to false and respond fully. Respond in strict JSON with keys: needs_more_detail (boolean), summary (2-3 sentence conversational overview, or the detail-request described above), skills (array of 3-6 concise skill labels demonstrated), relevance (a 2-3 sentence explanation of how this supports the intended major), relevance_score (integer 1-100 for how well this aligns with the major, or null when needs_more_detail is true), suggestions (array of 3-5 concrete ways to strengthen this experience), related (array of 3-5 short names of related opportunities to explore). Avoid clichés, never predict admissions.";

  const user_ =
    `Student: ${grade}, intended major: ${major}.\n` +
    `Activity: ${activity.name}\n` +
    `Category: ${activity.category}\n` +
    `Organization: ${activity.organization ?? "—"}\n` +
    `Leadership role: ${activity.leadership_role ?? "—"}\n` +
    `Description: ${activity.description ?? "—"}\n` +
    `Student-listed skills: ${(activity.skills ?? []).join(", ") || "—"}`;

  const parsed = await callAI(system, user_);
  const needsMoreDetail = parsed.needs_more_detail === true;
  const relevanceScore =
    !needsMoreDetail && typeof parsed.relevance_score === "number"
      ? Math.max(1, Math.min(100, Math.round(parsed.relevance_score)))
      : null;

  const analysis: Analysis = {
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : NOT_CONFIGURED_SUMMARY,
    skills:
      !needsMoreDetail && Array.isArray(parsed.skills)
        ? parsed.skills.slice(0, 8).map(String)
        : [],
    relevance:
      !needsMoreDetail && typeof parsed.relevance === "string"
        ? parsed.relevance
        : "",
    relevance_score: relevanceScore,
    suggestions:
      !needsMoreDetail && Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 6).map(String)
        : [],
    related:
      !needsMoreDetail && Array.isArray(parsed.related)
        ? parsed.related.slice(0, 6).map(String)
        : [],
    needs_more_detail: needsMoreDetail,
  };

  const { error: updErr } = await supabase
    .from("activities")
    .update({
      ai_summary: analysis.summary,
      ai_skills: analysis.skills,
      ai_relevance: analysis.relevance,
      ai_relevance_score: analysis.relevance_score,
      ai_suggestions: analysis.suggestions,
      ai_related: analysis.related,
      ai_needs_more_detail: analysis.needs_more_detail,
      ai_analyzed_at: new Date().toISOString(),
    })
    .eq("id", activityId)
    .eq("user_id", user.id);
  if (updErr) throw updErr;

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/activities");
  revalidatePath("/dashboard");

  return analysis;
}

// How long a generated recommendation set stays valid before a plain page
// load will regenerate it. The "Refresh" button passes force=true to bypass
// this — both paths still go through the daily rate limit in callAI().
const RECOMMENDATIONS_TTL_MS = 24 * 60 * 60 * 1000;

export async function getRecommendations(
  force = false,
): Promise<Recommendation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "intended_majors, grade_level, exploring, ai_recommendations, ai_recommendations_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const cachedAt = profile?.ai_recommendations_at
    ? new Date(profile.ai_recommendations_at).getTime()
    : 0;
  const isFresh = Date.now() - cachedAt < RECOMMENDATIONS_TTL_MS;
  if (
    !force &&
    isFresh &&
    Array.isArray(profile?.ai_recommendations) &&
    profile.ai_recommendations.length > 0
  ) {
    return profile.ai_recommendations as unknown as Recommendation[];
  }

  const { data: activities } = await supabase
    .from("activities")
    .select("name, category, leadership_role, skills, ai_skills")
    .eq("user_id", user.id);

  const major = formatMajors(profile?.intended_majors ?? []) || "undecided";
  const grade = profile?.grade_level ?? "unknown";
  const acts = (activities ?? [])
    .map(
      (a) =>
        `- ${a.name} (${a.category}${a.leadership_role ? `, ${a.leadership_role}` : ""})`,
    )
    .join("\n");

  const system =
    'You are an encouraging college counselor for high school students. Suggest 6 personalized next-step opportunities that would strengthen the student\'s college profile for their intended major. Return strict JSON: { "recommendations": [ { "title": string, "why": string (1-2 sentences), "category": string, "effort": "low"|"medium"|"high" } ] }. Vary categories: clubs, competitions, projects, volunteering, internships, certifications, research.';

  const user_ =
    `Student grade: ${grade}. Intended major: ${major}. ${profile?.exploring ? "They are exploring multiple majors." : ""}\n` +
    `Current activities:\n${acts || "(none yet)"}`;

  const parsed = await callAI(system, user_);
  const raw = Array.isArray(parsed.recommendations)
    ? parsed.recommendations
    : [];

  if (raw.length === 0) {
    return [
      {
        title: "AI recommendations aren't turned on yet",
        why: "Add an LLM API key and wire it into callAI() in src/lib/ai.ts to get personalized next-step suggestions based on your activities and intended major.",
        category: "Setup",
        effort: "low",
      },
    ];
  }

  const result = raw.slice(0, 8).map((r: Record<string, unknown>) => ({
    title: String(r.title ?? ""),
    why: String(r.why ?? ""),
    category: String(r.category ?? "General"),
    effort: (["low", "medium", "high"] as const).includes(
      r.effort as "low" | "medium" | "high",
    )
      ? (r.effort as "low" | "medium" | "high")
      : "medium",
  }));

  await supabase
    .from("profiles")
    .update({
      ai_recommendations: result,
      ai_recommendations_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return result;
}
