"use client";

import { Check, Eye, EyeOff, X } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "~/lib/supabase/client";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800"],
});

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "digit", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "symbol", label: "One symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

// Same k-anonymity breach check used on signup — only the first 5 chars of
// the SHA-1 hash ever leave the browser. Fails open on API errors.
async function isPasswordBreached(password: string): Promise<boolean> {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(password),
  );
  const hashHex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!res.ok) return false;
  const text = await res.text();
  return text.split("\n").some((line) => line.split(":")[0].trim() === suffix);
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password],
  );
  const passwordValid = passwordChecks.every((c) => c.met);

  useEffect(() => {
    // The /auth/confirm route already exchanged the recovery token_hash for
    // a session (via cookies) before redirecting here — getUser() confirms
    // that session actually exists rather than trusting the redirect alone.
    supabase.auth.getUser().then(({ data }) => {
      setHasRecoverySession(!!data.user);
      setCheckingSession(false);
    });
  }, [supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      toast.error("Password doesn't meet the requirements below.");
      return;
    }
    setLoading(true);
    try {
      const breached = await isPasswordBreached(password).catch(() => false);
      if (breached) {
        toast.error(
          "That password has appeared in a known data breach. Please choose a different one.",
        );
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p2m-auth ${poppins.className}`}>
      <div className="p2m-auth-wrap">
        <Link href="/" className="p2m-auth-brand">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="none" aria-hidden="true">
            <path
              d="M4 26 L12 18 L20 20 L28 6"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="4" cy="26" r="2.3" fill="currentColor" />
            <circle cx="12" cy="18" r="2.3" fill="currentColor" />
            <circle cx="20" cy="20" r="2.3" fill="currentColor" />
            <circle cx="28" cy="6" r="3" fill="currentColor" />
          </svg>
          PathToMajor
        </Link>

        <div className="p2m-auth-card">
          {checkingSession ? (
            <p className="p2m-auth-sub">Checking your reset link…</p>
          ) : !hasRecoverySession ? (
            <>
              <h1 className="p2m-auth-title">Link expired</h1>
              <p className="p2m-auth-sub">
                This password reset link is invalid or has expired. Request a
                new one from the sign-in page.
              </p>
              <Link
                href="/auth"
                className="p2m-auth-btn p2m-auth-btn-solid"
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="p2m-auth-title">Set a new password</h1>
              <p className="p2m-auth-sub">Choose a new password for your account.</p>

              <form onSubmit={submit} className="p2m-auth-form" style={{ marginTop: 20 }}>
                <div className="p2m-auth-password-wrap">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="p2m-auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p2m-auth-password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password.length > 0 && (
                  <ul className="p2m-auth-password-checklist">
                    {passwordChecks.map((c) => (
                      <li key={c.key} className={c.met ? "is-met" : ""}>
                        {c.met ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="p2m-auth-btn p2m-auth-btn-solid"
                >
                  {loading ? "…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
