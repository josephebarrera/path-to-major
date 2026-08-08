import { IBM_Plex_Mono, Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-p2m-display",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-p2m-mono",
});

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div className={`p2m-hero ${poppins.variable} ${ibmPlexMono.variable}`}>
        <nav className="nav">
          <div className="brand-lockup mono-line">
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
            PATHTOMAJOR
          </div>
          <div className="nav-links">
            <Link href="/auth" className="nav-signin">
              Sign in
            </Link>
            <Link href="/auth?mode=signup" className="btn btn-solid">
              Start free
            </Link>
          </div>
        </nav>
        <div className="wrap">
          <div className="head">
            <p className="mono-line eyebrow">For college bound high schoolers</p>
            <h1 className="disp">
              Here&apos;s what a real <em>score</em> looks like.
            </h1>
            <p>
              Log an extracurricular and PathToMajor scores how well it
              supports your intended major, with a category, a number, and the
              reasoning behind it.
            </p>
          </div>
          <div className="instrument-wrap">
            <div className="instrument">
              <div className="chrome">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span className="url">pathtomajor.app/activities/57</span>
              </div>
              <div className="body">
                <div className="top">
                  <div className="top-chip">
                    <span className="num-badge">1</span>
                    <span className="chip">BUSINESS</span>
                    <div className="name">Part Time Retail Associate</div>
                    <div className="hrs tabular">20.0 HRS LOGGED</div>
                  </div>
                  <div className="top-score">
                    <span className="num-badge">2</span>
                    <span
                      className="sc tabular"
                      style={{ color: "var(--p2m-signal)" }}
                    >
                      58<span className="sc-unit">/100</span>
                    </span>
                  </div>
                  <div className="major-field">
                    <span className="num-badge">3</span>
                    Intended major: <b>Computer Science</b>
                  </div>
                </div>
                <p className="note">
                  <span className="num-badge">4</span>
                  Not technical, but builds real world problem solving and
                  customer communication, a moderate, honest fit for Computer
                  Science.
                </p>
              </div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="num-badge">1</span>
                The category, from the app&apos;s own taxonomy
              </div>
              <div className="legend-item">
                <span className="num-badge">2</span>
                AI generated relevance score, out of 100
              </div>
              <div className="legend-item">
                <span className="num-badge">3</span>
                What the score is measured against
              </div>
              <div className="legend-item">
                <span className="num-badge">4</span>
                The reason, in plain language, not just a number
              </div>
            </div>
          </div>
          <div className="cta-row">
            <Link href="/auth?mode=signup" className="btn btn-solid">
              Start free
            </Link>
            <Link href="/auth" className="btn btn-ghost">
              I already have an account
            </Link>
          </div>
        </div>
      </div>

      <footer
        className={`border-t border-[#14161A]/10 bg-[#FAFAF7] ${ibmPlexMono.variable}`}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <Link href="/" className="footer-brand">
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
            PATHTOMAJOR
          </Link>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-5">
            <div className="flex items-center gap-4 text-xs font-semibold text-[#14161A]/75">
              <Link href="/privacy" className="hover:text-[#14161A]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#14161A]">
                Terms of Service
              </Link>
            </div>
            <p className="text-xs font-semibold text-[#14161A]/75">
              © {new Date().getFullYear()} PathToMajor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
