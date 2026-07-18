import { ProfileForm } from "~/components/profile-form";
import { createClient } from "~/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ProfileForm
      initialName={profile?.display_name ?? ""}
      initialGrade={profile?.grade_level ?? 10}
      initialMajors={profile?.intended_majors ?? []}
      initialExploring={profile?.exploring ?? false}
    />
  );
}
