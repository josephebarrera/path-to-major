"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/lib/supabase/server";

// Mirrors the form's client-side maxLength attributes — those are only a UX
// hint since a server action can be called directly, bypassing the UI
// entirely. Without this, an arbitrarily large description would still get
// sent to Gemini on every re-analysis, which the daily request cap doesn't
// protect against (it limits request count, not per-request size).
const MAX_NAME = 120;
const MAX_ORGANIZATION = 120;
const MAX_LEADERSHIP_ROLE = 80;
const MAX_DESCRIPTION = 1000;
const MAX_TIME_COMMITMENT = 80;
const MAX_SKILL_LENGTH = 60;
const MAX_SKILLS_COUNT = 20;

function validateActivityInput(input: {
  name: string;
  organization: string | null;
  description: string | null;
  leadershipRole: string | null;
  skills: string[];
  timeCommitment: string | null;
}) {
  if (input.name.length > MAX_NAME)
    throw new Error(`Activity name must be ${MAX_NAME} characters or fewer.`);
  if (input.organization && input.organization.length > MAX_ORGANIZATION)
    throw new Error(
      `Organization must be ${MAX_ORGANIZATION} characters or fewer.`,
    );
  if (input.leadershipRole && input.leadershipRole.length > MAX_LEADERSHIP_ROLE)
    throw new Error(
      `Leadership role must be ${MAX_LEADERSHIP_ROLE} characters or fewer.`,
    );
  if (input.description && input.description.length > MAX_DESCRIPTION)
    throw new Error(
      `Description must be ${MAX_DESCRIPTION} characters or fewer.`,
    );
  if (input.timeCommitment && input.timeCommitment.length > MAX_TIME_COMMITMENT)
    throw new Error(
      `Time commitment must be ${MAX_TIME_COMMITMENT} characters or fewer.`,
    );
  if (input.skills.length > MAX_SKILLS_COUNT)
    throw new Error(`List at most ${MAX_SKILLS_COUNT} skills.`);
  if (input.skills.some((s) => s.length > MAX_SKILL_LENGTH))
    throw new Error(
      `Each skill must be ${MAX_SKILL_LENGTH} characters or fewer.`,
    );
}

export async function completeOnboarding(input: {
  displayName: string;
  gradeLevel: number;
  intendedMajors: string[];
  exploring: boolean;
}) {
  if (input.intendedMajors.length === 0 && !input.exploring)
    throw new Error(
      "Pick at least one intended major, or check that you're still exploring",
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      grade_level: input.gradeLevel,
      intended_majors: input.intendedMajors.slice(0, 3),
      exploring: input.exploring,
      onboarded: true,
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function updateProfile(input: {
  displayName: string;
  gradeLevel: number;
  intendedMajors: string[];
  exploring: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      grade_level: input.gradeLevel,
      intended_majors: input.intendedMajors.slice(0, 3),
      exploring: input.exploring,
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function createActivity(input: {
  name: string;
  category: string;
  organization: string | null;
  description: string | null;
  leadershipRole: string | null;
  skills: string[];
  startDate: string | null;
  endDate: string | null;
  startGrade: number;
  endGrade: number | null;
  isSummer: boolean;
  startedBeforeHs: boolean;
  tracksHours: boolean;
  timeCommitment: string | null;
}) {
  validateActivityInput(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      name: input.name,
      category: input.category,
      organization: input.organization,
      description: input.description,
      leadership_role: input.leadershipRole,
      skills: input.skills,
      start_date: input.startDate,
      end_date: input.endDate,
      start_grade: input.startGrade,
      end_grade: input.endGrade,
      is_summer: input.isSummer,
      started_before_hs: input.startedBeforeHs,
      tracks_hours: input.tracksHours,
      time_commitment: input.timeCommitment,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  revalidatePath("/dashboard");
  return data;
}

export async function updateActivity(
  activityId: string,
  input: {
    name: string;
    category: string;
    organization: string | null;
    description: string | null;
    leadershipRole: string | null;
    skills: string[];
    startDate: string | null;
    endDate: string | null;
    startGrade: number;
    endGrade: number | null;
    isSummer: boolean;
    startedBeforeHs: boolean;
    tracksHours: boolean;
    timeCommitment: string | null;
  },
) {
  validateActivityInput(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("activities")
    .update({
      name: input.name,
      category: input.category,
      organization: input.organization,
      description: input.description,
      leadership_role: input.leadershipRole,
      skills: input.skills,
      start_date: input.startDate,
      end_date: input.endDate,
      start_grade: input.startGrade,
      end_grade: input.endGrade,
      is_summer: input.isSummer,
      started_before_hs: input.startedBeforeHs,
      tracks_hours: input.tracksHours,
      time_commitment: input.timeCommitment,
      // The edit may fix details the AI feedback was based on, so clear the
      // prior analysis and let AutoAnalyzeActivity re-run it automatically.
      ai_analyzed_at: null,
    })
    .eq("id", activityId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/activities");
  revalidatePath("/dashboard");
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  revalidatePath("/dashboard");
}

export async function addHourLog(input: {
  activityId: string;
  logDate: string;
  hours: number;
  note: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  if (!(input.hours > 0)) throw new Error("Hours must be > 0");

  const { error } = await supabase.from("hour_logs").insert({
    activity_id: input.activityId,
    user_id: user.id,
    log_date: input.logDate,
    hours: input.hours,
    note: input.note,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/activities/${input.activityId}`);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function deleteHourLog(logId: string, activityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("hour_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
