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
    <div className="min-h-screen bg-[var(--lp-card)] text-white">
      <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Last updated: {effectiveDate}
        </p>
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-white/80 sm:text-base">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center bg-[#eef1f5] text-[var(--lp-ink)]">
              <Compass className="h-3.5 w-3.5" />
            </span>
            PathToMajor
          </Link>
          <p className="text-xs text-white/60">
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
      <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
