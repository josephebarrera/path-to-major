"use server";

import { createClient } from "~/lib/supabase/server";

type SignInResult = { ok: true } | { ok: false; error: string };

// Runs sign-in server-side (instead of the client calling
// supabase.auth.signInWithPassword directly) so the rate-limit check can't
// be skipped by a client that simply doesn't call it. Locked out per email
// rather than per account so a wrong email can't be used to fingerprint
// which addresses have accounts.
export async function signInRateLimited(
  email: string,
  password: string,
): Promise<SignInResult> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: lockedUntil, error: lockErr } = await supabase.rpc(
    "check_login_lock",
    { p_email: normalizedEmail },
  );
  if (lockErr) {
    return {
      ok: false,
      error: "Couldn't verify sign-in attempts. Please try again.",
    };
  }
  if (lockedUntil) {
    const minutes = Math.max(
      1,
      Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 60_000),
    );
    return {
      ok: false,
      error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  await supabase.rpc("record_login_attempt", {
    p_email: normalizedEmail,
    p_success: !error,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
