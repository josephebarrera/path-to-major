import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-[#FAFAF7] text-[#14161A]">
      <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#14161A]/60 transition hover:text-[#14161A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[#14161A]/60">
          Last updated: {effectiveDate}
        </p>
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-[#14161A]/80 sm:text-base">
          {children}
        </div>
      </main>

      <footer className="border-t border-[#14161A]/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-[#14161A]"
          >
            <svg
              viewBox="0 0 32 32"
              width="18"
              height="18"
              fill="none"
              aria-hidden="true"
            >
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
          <p className="text-xs font-semibold text-[#14161A]/75">
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
