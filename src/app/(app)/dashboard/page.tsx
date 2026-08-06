import { Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DashboardTour } from "~/components/dashboard-tour";
import { HoursBreakdownCard } from "~/components/hours-breakdown-card";
import { NumberTicker } from "~/components/ui/number-ticker";
import { getRecommendations } from "~/lib/ai";
import { activityTimeLabel } from "~/lib/dates";
import { categoryStyle, formatMajors } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: activities }, { data: logs }, recommendations] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("hour_logs").select("*").eq("user_id", user.id),
      getRecommendations(),
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
  const topRecommendations = recommendations.slice(0, 3);
  const majorLabel = formatMajors(profile?.intended_majors ?? []);

  return (
    <div className="space-y-6">
      <DashboardTour hasSeenTour={profile?.has_seen_tour ?? false} />
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold">
            Hi {profile?.display_name?.split(" ")[0] ?? "there"}
          </h1>
          {majorLabel ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Building your path to{" "}
              <span className="font-medium text-foreground">{majorLabel}</span>
            </p>
          ) : (
            <Link
              href="/profile"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add your intended major
            </Link>
          )}
        </div>
        <Link
          data-tour="add-activity"
          href="/activities?new=true"
          className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add activity
        </Link>
      </div>

      <div data-tour="kpi-cards" className="grid gap-4 sm:grid-cols-3">
        <KPI
          icon={Target}
          label="Major alignment"
          value={avgRelevance}
          suffix="%"
          emptyLabel="—"
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
          label="Activities"
          value={acts.length}
          sub={acts.length ? "keep going" : "start your first"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
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
                    className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:bg-foreground/5"
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

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground" />
            <h2 className="text-lg font-semibold">What's next?</h2>
          </div>
          {topRecommendations.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Add an activity to unlock personalized AI suggestions.
            </p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {topRecommendations.map((r) => (
                <li key={r.title} className="rounded-xl border border-border p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {r.category}
                  </div>
                  <div className="mt-0.5 font-medium">{r.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.why}
                  </div>
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
  label,
  value,
  decimalPlaces = 0,
  suffix = "",
  emptyLabel,
  sub,
}: {
  icon: typeof Target;
  label: string;
  value: number;
  decimalPlaces?: number;
  suffix?: string;
  emptyLabel?: string;
  sub: string;
}) {
  const showEmpty = emptyLabel !== undefined && value === 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/90">
        <Icon className="h-4 w-4 text-foreground" />
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold">
        {showEmpty ? (
          emptyLabel
        ) : (
          <>
            <NumberTicker value={value} decimalPlaces={decimalPlaces} />
            {suffix}
          </>
        )}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function EmptyActivities() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-foreground/10 text-foreground">
        <Plus className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium">No activities yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add your first extracurricular to get instant AI feedback.
      </p>
      <Link
        href="/activities?new=true"
        className="mt-4 inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        <Plus className="h-4 w-4" /> Add activity
      </Link>
    </div>
  );
}
