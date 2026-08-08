import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";
import type { Database } from "./types";

// This client authenticates as service_role and bypasses RLS and all
// column-level GRANT restrictions entirely. Only use it to write columns
// ordinary users are deliberately blocked from touching (see the
// restrict_ai_column_writes migration), and only after the caller's
// ownership of the target row has already been verified with the regular
// session-scoped client (~/lib/supabase/server). Every query built with this
// client must still filter by the verified owner id itself -- there is no
// RLS backstop here, the query is the only enforcement.
export function createServiceClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. AI results can't be saved without it.",
    );
  }
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
