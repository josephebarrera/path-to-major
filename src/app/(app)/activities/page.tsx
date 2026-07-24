import { ActivitiesList } from "~/components/activities-list";
import { createClient } from "~/lib/supabase/server";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: openNewParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: activities }, { data: logs }] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("hour_logs").select("*").eq("user_id", user.id),
  ]);

  const hoursByActivity: Record<string, number> = {};
  for (const l of logs ?? []) {
    hoursByActivity[l.activity_id] =
      (hoursByActivity[l.activity_id] ?? 0) + Number(l.hours);
  }

  return (
    <ActivitiesList
      activities={activities ?? []}
      hoursByActivity={hoursByActivity}
      openNewDefault={openNewParam === "true"}
    />
  );
}
