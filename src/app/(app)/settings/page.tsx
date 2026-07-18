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

      <div className="glass-panel space-y-4 p-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Email</div>
          <div className="mt-1 text-sm">{user?.email}</div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
