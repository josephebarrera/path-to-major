"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { ErrorCard } from "~/components/error-card";

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
    <ErrorCard
      icon={AlertTriangle}
      title="Something went wrong"
      description="We hit an unexpected error. Try again, or head back home."
    >
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
    </ErrorCard>
  );
}
