import Link from "next/link";
import { ActivityHeaderActions } from "~/components/activity-header-actions";
import { AutoAnalyzeActivity } from "~/components/auto-analyze-activity";
import { HourLogPanel } from "~/components/hour-log-panel";
import { activityTimeLabel, gradeRangeLabel } from "~/lib/dates";
import { categoryStyle } from "~/lib/majors";
import { createClient } from "~/lib/supabase/server";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: activity }, { data: logs }] = await Promise.all([
    supabase.from("activities").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("hour_logs")
      .select("*")
      .eq("activity_id", id)
      .order("log_date", { ascending: false }),
  ]);

  if (!activity) {
    return <div className="p-6">Not found</div>;
  }

  const allLogs = logs ?? [];
  const totalHours = allLogs.reduce((s, l) => s + Number(l.hours), 0);
  const style = categoryStyle(activity.category);

  return (
    <div className="space-y-6">
      <AutoAnalyzeActivity
        activityId={activity.id}
        needsAnalysis={!activity.ai_analyzed_at}
      />
      <Link
        href="/activities"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to activities
      </Link>

      <div className="glass-panel relative isolate overflow-hidden p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
          style={{ background: style.glow }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${style.badge}`}
              >
                {activity.category}
              </span>
              {activity.organization && (
                <span className="text-sm text-muted-foreground">
                  · {activity.organization}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-semibold">{activity.name}</h1>
            {activity.leadership_role && (
              <p className="mt-1 text-sm text-muted-foreground">
                Role: {activity.leadership_role}
              </p>
            )}
            {activity.start_grade && (
              <p className="mt-1 text-sm text-muted-foreground">
                {gradeRangeLabel(activity.start_grade, activity.end_grade)}
              </p>
            )}
          </div>
          <ActivityHeaderActions activity={activity} />
        </div>

        {activity.description && (
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            {activity.description}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {activity.tracks_hours ? (
            <>
              <StatBox label="Total hours" value={totalHours.toFixed(1)} />
              <StatBox label="Sessions" value={String(allLogs.length)} />
            </>
          ) : (
            <StatBox
              label="Time commitment"
              value={activityTimeLabel(activity)}
            />
          )}
          <StatBox
            label="Major alignment"
            value={
              activity.ai_relevance_score != null
                ? `${activity.ai_relevance_score}%`
                : "—"
            }
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">AI feedback</h2>
          </div>
          {!activity.ai_analyzed_at ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Analyzing your activity… this usually takes a few seconds.
            </p>
          ) : (
            <div className="mt-4 space-y-5 text-sm">
              {activity.ai_summary && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Summary
                  </h3>
                  <p className="mt-1">{activity.ai_summary}</p>
                </section>
              )}
              {activity.ai_skills.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Skills identified
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activity.ai_skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/70 px-2.5 py-1 text-xs dark:bg-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {activity.ai_relevance && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Why this supports your major
                  </h3>
                  <p className="mt-1">{activity.ai_relevance}</p>
                </section>
              )}
              {activity.ai_suggestions.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ways to strengthen this
                  </h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    {activity.ai_suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </section>
              )}
              {activity.ai_related.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Related opportunities
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activity.ai_related.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border bg-white/60 px-2.5 py-1 text-xs dark:bg-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {activity.tracks_hours ? (
          <HourLogPanel activityId={activity.id} logs={allLogs} />
        ) : (
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold">Time commitment</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {activityTimeLabel(activity)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
