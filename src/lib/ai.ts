"use server";

import { revalidatePath } from "next/cache";
import { formatMajors } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

type Analysis = {
  summary: string;
  skills: string[];
  relevance: string;
  relevance_score: number | null;
  suggestions: string[];
  related: string[];
};

type Recommendation = {
  title: string;
  why: string;
  category: string;
  effort: "low" | "medium" | "high";
};

const NOT_CONFIGURED_SUMMARY =
  "AI feedback isn't turned on yet for this app. Add an LLM API key and wire it into callAI() in src/lib/ai.ts to enable personalized analysis.";

/**
 * Placeholder for the real LLM call. No API key is configured yet, so this
 * returns nothing and callers fall back to honest "not configured" copy
 * instead of fake AI-sounding text. To enable real feedback, call your
 * provider here (e.g. Anthropic's Messages API) with `system` and `user`,
 * and return the parsed JSON response matching what each caller expects.
 */
async function callAI(
  _system: string,
  _user: string,
): Promise<Record<string, unknown>> {
  return {};
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
    "You are a supportive college counselor for high school students. You give warm, specific, and actionable feedback about how a student's extracurricular activity connects to their intended college major. Respond in strict JSON with keys: summary (2-3 sentence conversational overview), skills (array of 3-6 concise skill labels demonstrated), relevance (a 2-3 sentence explanation of how this supports the intended major), relevance_score (integer 1-100 for how well this aligns with the major), suggestions (array of 3-5 concrete ways to strengthen this experience), related (array of 3-5 short names of related opportunities to explore). Be encouraging, avoid clichés, never predict admissions.";

  const user_ =
    `Student: ${grade}, intended major: ${major}.\n` +
    `Activity: ${activity.name}\n` +
    `Category: ${activity.category}\n` +
    `Organization: ${activity.organization ?? "—"}\n` +
    `Leadership role: ${activity.leadership_role ?? "—"}\n` +
    `Description: ${activity.description ?? "—"}\n` +
    `Student-listed skills: ${(activity.skills ?? []).join(", ") || "—"}`;

  const parsed = await callAI(system, user_);
  const relevanceScore =
    typeof parsed.relevance_score === "number"
      ? Math.max(1, Math.min(100, Math.round(parsed.relevance_score)))
      : null;

  const analysis: Analysis = {
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : NOT_CONFIGURED_SUMMARY,
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.slice(0, 8).map(String)
      : [],
    relevance: typeof parsed.relevance === "string" ? parsed.relevance : "",
    relevance_score: relevanceScore,
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 6).map(String)
      : [],
    related: Array.isArray(parsed.related)
      ? parsed.related.slice(0, 6).map(String)
      : [],
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
      ai_analyzed_at: new Date().toISOString(),
    })
    .eq("id", activityId);
  if (updErr) throw updErr;

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/activities");
  revalidatePath("/dashboard");

  return analysis;
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("intended_majors, grade_level, exploring")
    .eq("id", user.id)
    .maybeSingle();
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

  return raw.slice(0, 8).map((r: Record<string, unknown>) => ({
    title: String(r.title ?? ""),
    why: String(r.why ?? ""),
    category: String(r.category ?? "General"),
    effort: (["low", "medium", "high"] as const).includes(
      r.effort as "low" | "medium" | "high",
    )
      ? (r.effort as "low" | "medium" | "high")
      : "medium",
  }));
}
