import { LogOut } from "lucide-react";
import { signOut } from "~/lib/actions";
import { createClient } from "~/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account.
        </p>
      </div>

      <div className="rounded-2xl border border-white/15 bg-card space-y-4 p-6 shadow-lg">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Email</div>
          <div className="mt-1 text-sm">{user?.email}</div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
