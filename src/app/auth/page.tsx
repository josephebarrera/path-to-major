"use client";

import { Check, Eye, EyeOff, X } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { signInRateLimited } from "~/lib/auth-actions";
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

// Checks the password against the Have I Been Pwned breach corpus using
// k-anonymity: only the first 5 chars of the SHA-1 hash ever leave the
// browser, so the real password (and even the full hash) is never sent
// anywhere. Fails open (treats as "not breached") if the API is unreachable
// so a third-party outage can never block signup.
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
  return text
    .split("\n")
    .some((line) => line.split(":")[0].trim() === suffix);
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [supabase] = useState(() => createClient());

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(
    initialMode,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password],
  );
  const passwordValid = passwordChecks.every((c) => c.met);

  useEffect(() => {
    // getUser() validates the session against Supabase's Auth server, unlike
    // getSession() which just reads local storage. A stale/expired local
    // session would make getSession() report "signed in" here while the
    // (app) layout's server-side getUser() check disagrees and bounces back
    // to /auth, causing an infinite redirect loop between the two pages.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push("/dashboard");
    });
  }, [router, supabase]);

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      toast.error("Google sign-in didn't go through. Please try again.");
      router.replace("/auth");
    }
  }, [searchParams, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!passwordValid) {
          toast.error("Password doesn't meet the requirements below.");
          return;
        }
        const breached = await isPasswordBreached(password).catch(
          () => false,
        );
        if (breached) {
          toast.error(
            "That password has appeared in a known data breach. Please choose a different one.",
          );
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
          },
        });
        if (error) throw error;
        toast.success("Welcome to PathToMajor!");
      } else {
        const result = await signInRateLimited(email, password);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success("Check your email for a reset link.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
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
          <h1 className="p2m-auth-title">
            {mode === "signup"
              ? "Create your account"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome back"}
          </h1>
          <p className="p2m-auth-sub">
            {mode === "signup"
              ? "Start building your path to college."
              : mode === "forgot"
                ? "Enter your email and we'll send you a reset link."
                : "Sign in to continue."}
          </p>

          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={google}
                disabled={loading}
                className="p2m-auth-btn p2m-auth-btn-ghost"
              >
                Continue with Google
              </button>

              <div className="p2m-auth-divider">
                <span />
                or
                <span />
              </div>
            </>
          )}

          {mode === "forgot" ? (
            <form onSubmit={sendResetLink} className="p2m-auth-form">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="p2m-auth-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="p2m-auth-btn p2m-auth-btn-solid"
              >
                {loading ? "…" : "Send reset link"}
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="p2m-auth-form">
              {mode === "signup" && (
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                  className="p2m-auth-input"
                />
              )}
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="p2m-auth-input"
              />
              <div className="p2m-auth-password-wrap">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="p2m-auth-toggle"
                  style={{ marginTop: 0, textAlign: "right" }}
                >
                  Forgot password?
                </button>
              )}
              {mode === "signup" && password.length > 0 && (
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
                {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() =>
              setMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")
            }
            className="p2m-auth-toggle"
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : mode === "forgot"
                ? "Back to sign in"
                : "New to PathToMajor? Create an account"}
          </button>

          {mode === "signup" && (
            <p className="p2m-auth-terms">
              By creating an account, you agree to our{" "}
              <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
