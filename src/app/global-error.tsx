"use client";

import { useEffect } from "react";
import "./globals.css";

export default function RootError({
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
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
          <div className="glass-panel-navy w-full max-w-md p-8 text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The app hit an unexpected error. Try reloading the page.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
