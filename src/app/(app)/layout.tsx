import { redirect } from "next/navigation";
import { AppSidebar, MobileNav } from "~/components/app-sidebar";
import { createClient } from "~/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("intended_majors, onboarded, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        <AppSidebar
          intendedMajors={profile.intended_majors}
          isAdmin={profile.is_admin}
        />
        <MobileNav />
        <main className="min-w-0 flex-1 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
