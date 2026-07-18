"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/lib/supabase/server";

export async function completeOnboarding(input: {
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
      onboarded: true,
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
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
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);
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
  const { error } = await supabase.from("hour_logs").delete().eq("id", logId);
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
