import { Clock, Compass, Sparkles, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AlignmentRing } from "~/components/alignment-ring";

const EXAMPLES = [
  {
    category: "Robotics",
    activity: "Programming Lead, FIRST Robotics",
    major: "Computer Science",
    score: 94,
    feedback:
      "Strongly supports Computer Science through programming, leadership, and engineering design.",
    skills: ["Programming", "Leadership"],
  },
  {
    category: "Club",
    activity: "VP of Marketing, DECA Chapter",
    major: "Business Administration",
    score: 64,
    feedback:
      "Shows leadership and communication skills that support Business or Marketing. Look for a role with more direct sales or financial strategy experience to strengthen this further.",
    skills: ["Leadership", "Communication"],
  },
  {
    category: "Job",
    activity: "Weekend Cashier, Grocery Store",
    major: "Nursing",
    score: 32,
    feedback:
      "Builds reliability and customer service, which matter in patient care, but has little direct connection to Nursing coursework or clinical experience. Look into hospital volunteering or shadowing a healthcare provider to strengthen this.",
    skills: ["Responsibility", "Customer Service"],
  },
];

const FEATURE_GRADIENT =
  "radial-gradient(120% 140% at 100% 0%, oklch(0.68 0.18 40 / 0.85), transparent 60%), linear-gradient(150deg, oklch(0.32 0.1 258), oklch(0.55 0.16 45))";

const FEATURES = [
  {
    icon: Target,
    title: "Align to your major",
    body: "Pick your intended major and see how each activity connects to it.",
  },
  {
    icon: Sparkles,
    title: "AI feedback, instantly",
    body: "Every activity gets a personalized breakdown of skills, relevance, and next steps.",
  },
  {
    icon: TrendingUp,
    title: "Track hours over time",
    body: "Log sessions as you go and watch your total hours grow throughout high school.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-3 z-50 mx-auto max-w-6xl px-4 sm:top-4 sm:px-6">
        <div className="glass glass-noise flex items-center justify-between rounded-full px-3 py-2 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </span>
            PathToMajor
          </Link>
          <nav className="relative z-10 flex items-center gap-2 whitespace-nowrap text-sm sm:gap-3">
            <Link
              href="/auth"
              className="hidden rounded-full bg-[#0a1a3f] px-4 py-2 font-medium text-white transition hover:bg-[#132a5c] sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/auth?mode=signup"
              className="rounded-full bg-primary px-3 py-2 font-medium text-primary-foreground transition hover:opacity-90 sm:px-4"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <section className="glass-panel hero-padding relative overflow-hidden px-6 text-center sm:px-14">
          <div
            aria-hidden
            className="animate-float absolute -top-16 -left-10 h-56 w-56 rounded-full opacity-60 blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div
            aria-hidden
            className="animate-float absolute -right-16 top-10 h-64 w-64 rounded-full opacity-50 blur-3xl"
            style={{
              background: "var(--gradient-accent)",
              animationDelay: "2.2s",
            }}
          />
          <div
            aria-hidden
            className="animate-float absolute bottom-[-4rem] left-1/3 h-48 w-48 rounded-full opacity-40 blur-3xl"
            style={{
              background: "var(--gradient-primary)",
              animationDelay: "4.1s",
            }}
          />

          <div className="relative mx-auto flex flex-col items-center gap-3">
            <span
              className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg sm:h-16 sm:w-16"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Compass className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <span className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              PathToMajor
            </span>
          </div>
          <h1 className="relative mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-[1.1] sm:mt-6 sm:text-5xl sm:leading-[1.05] lg:text-6xl [@media(max-height:820px)]:lg:text-5xl">
            Know exactly what to do outside of class for your{" "}
            <span className="text-gradient">future major</span>.
          </h1>
          <p className="relative mx-auto mt-4 max-w-2xl text-base text-foreground/90 sm:mt-6 sm:text-lg">
            Colleges want more than good grades, but it's hard to know if what
            you're doing actually counts. PathToMajor shows how your activities,
            projects, and leadership connect to the major you're aiming for, and
            exactly what to add next.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3 sm:mt-8">
            <Link
              href="/auth?mode=signup"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              href="/auth"
              className="rounded-full bg-[#0a1a3f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#132a5c]"
            >
              I already have an account
            </Link>
          </div>
          <p className="relative mt-4 text-xs text-foreground/80 sm:mt-6">
            50+ majors covered · Grades 9–12 · Free to start
          </p>
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#0a1a3f] sm:text-3xl">
              Real feedback, any major
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-[#0a1a3f]/80 sm:text-base">
              Three real examples: a strong fit, a decent one, and one that
              needs work. You get honest scores you can act on, not
              participation trophies.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.activity}
                className="flex h-full flex-col rounded-2xl border border-white/15 bg-card p-5 text-left shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                      {ex.category}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold">
                      {ex.activity}
                    </h3>
                  </div>
                  <AlignmentRing score={ex.score} />
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3.5 w-3.5 shrink-0 text-primary" />
                  Aligned to{" "}
                  <span className="font-medium text-foreground">
                    {ex.major}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  "{ex.feedback}"
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  {ex.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="grain-overlay rounded-2xl border border-white/25 p-6 shadow-lg"
              style={{ background: FEATURE_GRADIENT }}
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/30 bg-white/20 text-white backdrop-blur">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 text-base font-semibold text-white">
                {f.title}
              </h3>
              <p className="relative mt-2 text-sm text-white/80">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-[#0a1a3f]/80">
          <Clock className="h-3.5 w-3.5" />
          Takes less than 5 minutes to see your first AI feedback.
        </section>
      </main>
    </div>
  );
}
