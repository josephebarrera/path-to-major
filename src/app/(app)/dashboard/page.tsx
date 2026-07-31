import { Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { HoursBreakdownCard } from "~/components/hours-breakdown-card";
import { NumberTicker } from "~/components/ui/number-ticker";
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("hour_logs").select("*").eq("user_id", user.id),
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

  const hoursBreakdown = acts
    .filter((a) => (hoursByActivity.get(a.id) ?? 0) > 0)
    .map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      hours: hoursByActivity.get(a.id) ?? 0,
    }))
    .sort((a, b) => b.hours - a.hours);

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
      <div className="flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
        <div>
          <p className="text-sm text-white/75">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white">
            Hi {profile?.display_name?.split(" ")[0] ?? "there"}
          </h1>
          {majorLabel ? (
            <p className="mt-1 text-sm text-white/80">
              Building your path to{" "}
              <span className="font-medium text-white">{majorLabel}</span>
            </p>
          ) : (
            <Link
              href="/profile"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add your intended major
            </Link>
          )}
        </div>
        <Link
          href="/activities?new=true"
          className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-medium text-[var(--lp-ink)] transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" /> Add activity
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPI
          icon={Target}
          accent="bg-white/10 text-white"
          label="Major alignment"
          value={avgRelevance}
          suffix="%"
          emptyLabel="—"
          progress={avgRelevance}
          sub={
            analyzed.length
              ? `across ${analyzed.length} analyzed`
              : "add an activity"
          }
        />
        <HoursBreakdownCard
          totalHours={totalHours}
          sessionCount={allLogs.length}
          breakdown={hoursBreakdown}
        />
        <KPI
          icon={TrendingUp}
          accent="bg-white/10 text-white"
          label="Activities"
          value={acts.length}
          sub={acts.length ? "keep going" : "start your first"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="hierarchy-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activities</h2>
            <Link
              href="/activities"
              className="text-sm text-white hover:text-white/80"
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
                    className="flex items-center justify-between border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                        >
                          {a.category}
                        </span>
                        {a.ai_relevance_score != null && (
                          <span className="text-xs text-white">
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
                          <div className="text-xs text-white">total</div>
                        </>
                      ) : (
                        <div className="max-w-[8rem] text-xs text-white">
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

        <div className="hierarchy-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--lp-blue-floor)]" />
            <h2 className="text-lg font-semibold">What's next?</h2>
          </div>
          {suggestions.length === 0 ? (
            <p className="mt-3 text-sm text-white">
              Add an activity to unlock personalized AI suggestions.
            </p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {suggestions.map((s) => (
                <li
                  key={`${s.a}-${s.s}`}
                  className="border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-[11px] uppercase tracking-wide text-white">
                    from {s.a}
                  </div>
                  <div className="mt-0.5">{s.s}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-center">
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-1 bg-white px-4 py-2 text-sm font-medium text-[var(--lp-ink)] transition hover:bg-white/90"
            >
              See all recommendations →
            </Link>
          </div>
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
  decimalPlaces = 0,
  suffix = "",
  emptyLabel,
  progress,
  sub,
}: {
  icon: typeof Target;
  accent: string;
  label: string;
  value: number;
  decimalPlaces?: number;
  suffix?: string;
  emptyLabel?: string;
  progress?: number;
  sub: string;
}) {
  const showEmpty = emptyLabel !== undefined && value === 0;
  return (
    <div className="hierarchy-stat-card p-5">
      <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-white">
        <span className={`grid h-8 w-8 place-items-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-[var(--lp-blue-floor)]">
        {showEmpty ? (
          emptyLabel
        ) : (
          <>
            <NumberTicker value={value} decimalPlaces={decimalPlaces} />
            {suffix}
          </>
        )}
      </div>
      {progress !== undefined ? (
        <div className="mt-3 h-[5px] w-full bg-white/10">
          <div
            className="h-full bg-[var(--lp-blue-floor)]"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : (
        <div className="mt-1 text-xs text-white">{sub}</div>
      )}
    </div>
  );
}

function EmptyActivities() {
  return (
    <div className="mt-4 border border-dashed border-border p-8 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center bg-white/10 text-white">
        <Plus className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium">No activities yet</p>
      <p className="mt-1 text-xs text-white">
        Add your first extracurricular to get instant AI feedback.
      </p>
      <Link
        href="/activities?new=true"
        className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 text-sm font-medium text-[var(--lp-ink)]"
      >
        <Plus className="h-4 w-4" /> Add activity
      </Link>
    </div>
  );
}
