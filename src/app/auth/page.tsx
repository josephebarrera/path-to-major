"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "~/lib/supabase/client";

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

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push("/dashboard");
      router.refresh();
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--lp-card)] px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-sm font-bold text-white"
        >
          <span className="grid h-7 w-7 place-items-center bg-[#eef1f5] text-[var(--lp-ink)]">
            <Compass className="h-3.5 w-3.5" />
          </span>
          PathToMajor
        </Link>

        <h1 className="text-center text-2xl font-bold text-white">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-white/60">
          {mode === "signup"
            ? "Start building your path to college."
            : "Sign in to continue."}
        </p>

        <button
          type="button"
          onClick={google}
          disabled={loading}
          className="mt-8 w-full border border-white/40 py-2.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-white/40">
          <div className="h-px flex-1 bg-white/20" />
          or
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="w-full border border-white/30 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-white/30 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-white/30 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white py-2.5 text-sm font-medium text-[var(--lp-ink)] transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-4 w-full text-center text-sm text-white/60 hover:text-white"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New to PathToMajor? Create an account"}
        </button>

        {mode === "signup" && (
          <p className="mt-4 text-center text-xs text-white/60">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
