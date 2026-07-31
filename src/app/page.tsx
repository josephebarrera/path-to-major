import { Compass } from "lucide-react";
import localFont from "next/font/local";
import Link from "next/link";
import { Fragment } from "react";
import { LandingNav } from "~/components/landing-nav";

const brittany = localFont({
  src: "./fonts/BrittanySignature.ttf",
  weight: "400",
  style: "normal",
  display: "block",
  adjustFontFallback: false,
});

const HERO_HEADLINE = "Made for your";
const HERO_SCRIPT = "future major.";

const STEPS = [
  {
    title: "Log it",
    desc: "Clubs, jobs, sports, leadership, volunteering — with when and how long.",
  },
  {
    title: "Get scored",
    desc: "AI feedback on how well it supports the major you're aiming for.",
  },
  {
    title: "Act on it",
    desc: "Specific next steps to strengthen your case.",
  },
] as const;

export default function Landing() {
  let charIndex = -1;
  // Fixed, hardcoded headline string — never reordered, filtered, or
  // mutated, so the index is a stable, safe key here.
  const headlineNodes = HERO_HEADLINE.split("").map((ch, i) => {
    // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
    if (ch === " ") return <Fragment key={i}>&nbsp;</Fragment>;
    charIndex += 1;
    const delay = 60 + charIndex * 18;
    return (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
        key={i}
        className="lp-reveal-char"
        style={{ animationDelay: `${delay}ms` }}
      >
        {ch}
      </span>
    );
  });

  return (
    <>
      <LandingNav />

      <div className="lp-hero-region">
        <div className="lp-bg-gradient" />

        <section className="lp-hero">
          <p
            className="lp-hero-eyebrow lp-reveal"
            style={{ animationDelay: "0ms" }}
          >
            <span className="lp-hero-eyebrow-icon">
              <Compass className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            PathToMajor
          </p>
          <h1 className="lp-hero-title">
            <span className="lp-hero-title-bold">{headlineNodes}</span>
            <span
              className={`lp-hero-title-script lp-reveal-wipe ${brittany.className}`}
              style={{ animationDelay: "400ms" }}
            >
              {HERO_SCRIPT}
            </span>
          </h1>
          <p
            className="lp-hero-body lp-reveal"
            style={{ animationDelay: "950ms" }}
          >
            Colleges want more than good grades, but it's hard to know if what
            you're doing actually counts. PathToMajor shows how your activities,
            projects, and leadership connect to the major you're aiming for, and
            what exactly to add next.
          </p>
          <Link
            href="/auth?mode=signup"
            className="lp-hero-cta lp-reveal lp-reveal-cta"
            style={{ animationDelay: "1150ms" }}
          >
            Get started
          </Link>
        </section>
      </div>

      <section className="lp-how-it-works">
        <div className="lp-hiw-inner">
          <div className="lp-hiw-grid">
            <div>
              <p className="lp-hiw-eyebrow">How it works</p>
              <h2 className="lp-hiw-headline">
                Three Steps.
                <br />
                No guessing.
              </h2>
            </div>
            <div className="lp-hiw-steps">
              {STEPS.map((step, i) => (
                <div className="lp-hiw-step" key={step.title}>
                  <span className="lp-hiw-step-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="lp-hiw-step-title">{step.title}</p>
                    <p className="lp-hiw-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="lp-cta-band">
        <h2 className="lp-cta-headline">Start free today</h2>
        <p className="lp-cta-sub">
          No credit card. No app to download. Built for students, not schools.
        </p>
        <div className="lp-cta-form">
          <Link href="/auth?mode=signup" className="lp-cta-button">
            Get started
          </Link>
        </div>
        <p className="lp-cta-meta">Free to start · Grades 9–12 · Pre-launch</p>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-footer-mark" aria-hidden="true">
              <Compass className="h-[14px] w-[14px]" strokeWidth={2} />
            </span>
            PathToMajor
          </div>
          <p className="lp-footer-copyright">&copy; 2026 PathToMajor</p>
          <nav className="lp-footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
