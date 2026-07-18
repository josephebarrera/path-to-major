import { Clock, Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { activityTimeLabel } from "~/lib/dates";
import { categoryStyle, formatMajors } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: activities }, { data: logs }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("hour_logs").select("*"),
    ]);

  const acts = activities ?? [];
  const allLogs = logs ?? [];

  const totalHours = allLogs.reduce((s, l) => s + Number(l.hours), 0);

  const hoursByActivity = new Map<string, number>();
  for (const l of allLogs) {
    hoursByActivity.set(
      l.activity_id,
      (hoursByActivity.get(l.activity_id) ?? 0) + Number(l.hours),
    );
  }

  const analyzed = acts.filter((a) => a.ai_relevance_score != null);
  const avgRelevance = analyzed.length
    ? Math.round(
        analyzed.reduce((s, a) => s + (a.ai_relevance_score ?? 0), 0) /
          analyzed.length,
      )
    : 0;

  const recent = acts.slice(0, 4);
  const suggestions = acts
    .flatMap((a) => (a.ai_suggestions ?? []).map((s) => ({ s, a: a.name })))
    .slice(0, 4);
  const majorLabel = formatMajors(profile?.intended_majors ?? []);

  return (
    <div className="space-y-6">
      <div className="aurora-panel flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
        <div className="relative">
          <p className="text-sm text-white/80">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white">
            Hi {profile?.display_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          {majorLabel && (
            <p className="mt-1 text-sm text-white/80">
              Building your path to{" "}
              <span className="font-medium text-white">{majorLabel}</span>
            </p>
          )}
        </div>
        <Link
          href="/activities?new=true"
          className="relative inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" /> Add activity
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPI
          icon={Target}
          accent="bg-blue-500/15 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
          label="Major alignment"
          value={`${avgRelevance || "—"}${avgRelevance ? "%" : ""}`}
          sub={
            analyzed.length
              ? `across ${analyzed.length} analyzed`
              : "add an activity"
          }
        />
        <KPI
          icon={Clock}
          accent="bg-orange-500/15 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400"
          label="Total hours"
          value={totalHours.toFixed(1)}
          sub={`${allLogs.length} sessions logged`}
        />
        <KPI
          icon={TrendingUp}
          accent="bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
          label="Activities"
          value={String(acts.length)}
          sub={acts.length ? "keep going" : "start your first"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activities</h2>
            <Link
              href="/activities"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyActivities />
          ) : (
            <div className="mt-4 space-y-2">
              {recent.map((a) => {
                const style = categoryStyle(a.category);
                return (
                  <Link
                    key={a.id}
                    href={`/activities/${a.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/60 bg-white/50 p-4 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                        >
                          {a.category}
                        </span>
                        {a.ai_relevance_score != null && (
                          <span className="text-xs text-muted-foreground">
                            {a.ai_relevance_score}% aligned
                          </span>
                        )}
                      </div>
                      <div className="mt-1 truncate font-medium">{a.name}</div>
                    </div>
                    <div className="text-right text-sm">
                      {a.tracks_hours ? (
                        <>
                          <div className="font-medium">
                            {(hoursByActivity.get(a.id) ?? 0).toFixed(1)}h
                          </div>
                          <div className="text-xs text-muted-foreground">
                            total
                          </div>
                        </>
                      ) : (
                        <div className="max-w-[8rem] text-xs text-muted-foreground">
                          {activityTimeLabel(a)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold">What's next?</h2>
          </div>
          {suggestions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Add an activity to unlock personalized AI suggestions.
            </p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {suggestions.map((s) => (
                <li
                  key={`${s.a}-${s.s}`}
                  className="rounded-xl border border-white/60 bg-white/50 p-3 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    from {s.a}
                  </div>
                  <div className="mt-0.5">{s.s}</div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/recommendations"
            className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            See all recommendations →
          </Link>
        </div>
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  accent,
  label,
  value,
  sub,
}: {
  icon: typeof Target;
  accent: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2.5 text-xs uppercase tracking-wide text-muted-foreground">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${accent}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function EmptyActivities() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Plus className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium">No activities yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add your first extracurricular to get instant AI feedback.
      </p>
      <Link
        href="/activities?new=true"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> Add activity
      </Link>
    </div>
  );
}
