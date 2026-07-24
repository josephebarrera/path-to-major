import { ProgressCharts } from "~/components/progress-charts";
import { formatMajors } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: activities }, { data: logs }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("intended_majors")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("activities").select("*").eq("user_id", user.id),
      supabase.from("hour_logs").select("*").eq("user_id", user.id),
    ]);

  return (
    <ProgressCharts
      intendedMajor={formatMajors(profile?.intended_majors ?? []) || null}
      activities={activities ?? []}
      logs={logs ?? []}
    />
  );
}
