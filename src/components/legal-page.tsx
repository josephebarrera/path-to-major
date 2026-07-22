import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {effectiveDate}
        </p>
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-foreground/80 sm:text-base">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-3.5 w-3.5" />
            </span>
            PathToMajor
          </Link>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PathToMajor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
