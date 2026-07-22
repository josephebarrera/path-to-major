"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel-navy w-full max-w-md p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We hit an unexpected error. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <RotateCw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border bg-white/10 py-2.5 text-sm text-foreground transition hover:bg-white/20"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
