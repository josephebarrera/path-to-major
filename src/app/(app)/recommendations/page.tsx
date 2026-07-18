import { RecommendationsView } from "~/components/recommendations-view";
import { getRecommendations } from "~/lib/ai";
import { formatMajors } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, recommendations] = await Promise.all([
    supabase
      .from("profiles")
      .select("intended_majors")
      .eq("id", user.id)
      .maybeSingle(),
    getRecommendations(),
  ]);

  return (
    <RecommendationsView
      intendedMajor={formatMajors(profile?.intended_majors ?? []) || null}
      initialRecommendations={recommendations}
    />
  );
}
