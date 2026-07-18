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
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
  }, [router, supabase]);

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </span>
          PathToMajor
        </Link>

        <div className="glass-panel p-8">
          <h1 className="text-2xl font-semibold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Start building your path to college."
              : "Sign in to continue."}
          </p>

          <button
            type="button"
            onClick={google}
            disabled={loading}
            className="mt-6 w-full rounded-full border border-border bg-white/70 py-2.5 text-sm font-medium text-foreground backdrop-blur transition hover:bg-white disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                className="w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none backdrop-blur focus:ring-2 focus:ring-ring dark:bg-white/10"
              />
            )}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none backdrop-blur focus:ring-2 focus:ring-ring dark:bg-white/10"
            />
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none backdrop-blur focus:ring-2 focus:ring-ring dark:bg-white/10"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New to PathToMajor? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
