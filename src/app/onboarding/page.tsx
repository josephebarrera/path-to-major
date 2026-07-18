import { redirect } from "next/navigation";
import { OnboardingWizard } from "~/components/onboarding-wizard";
import { createClient } from "~/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.onboarded) redirect("/dashboard");

  const meta = user.user_metadata as { full_name?: string } | null;
  const initialName = meta?.full_name ?? user.email?.split("@")[0] ?? "";

  return <OnboardingWizard initialName={initialName} />;
}
