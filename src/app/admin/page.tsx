import { AdminDashboard } from "~/components/admin-dashboard";
import { createClient } from "~/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: activities }, { data: logs }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("activities").select("*"),
      supabase.from("hour_logs").select("*"),
    ]);

  return (
    <AdminDashboard
      profiles={profiles ?? []}
      activities={activities ?? []}
      logs={logs ?? []}
    />
  );
}
