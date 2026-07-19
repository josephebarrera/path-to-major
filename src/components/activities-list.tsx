"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActivityFormModal } from "~/components/activity-form-modal";
import { activityTimeLabel, gradesForActivity } from "~/lib/dates";
import { ACTIVITY_CATEGORIES, categoryStyle } from "~/lib/majors";
import type { Tables } from "~/lib/supabase/types";

type Activity = Tables<"activities">;

const GRADE_TABS = ["All", 9, 10, 11, 12] as const;
const GRADE_TAB_LABEL: Record<(typeof GRADE_TABS)[number], string> = {
  All: "All",
  9: "9th",
  10: "10th",
  11: "11th",
  12: "12th",
};

export function ActivitiesList({
  activities,
  hoursByActivity,
  openNewDefault,
}: {
  activities: Activity[];
  hoursByActivity: Record<string, number>;
  openNewDefault: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("All");
  const [gradeFilter, setGradeFilter] =
    useState<(typeof GRADE_TABS)[number]>("All");
  const [showNew, setShowNew] = useState(openNewDefault);

  const filtered = activities.filter(
    (a) =>
      (filter === "All" || a.category === filter) &&
      (gradeFilter === "All" || gradesForActivity(a).includes(gradeFilter)),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every extracurricular, project, and role you've taken on.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add activity
        </button>
      </div>

      <div className="flex gap-1 rounded-full border border-white/15 bg-card p-1">
        {GRADE_TABS.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              gradeFilter === g
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {GRADE_TAB_LABEL[g]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", ...ACTIVITY_CATEGORIES] as const).map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === c
                ? "bg-primary text-primary-foreground"
                : "border border-white/15 bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel-navy p-12 text-center">
          <p className="text-sm font-medium">No activities here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "All" && gradeFilter === "All"
              ? "Add your first activity to get personalized AI feedback."
              : "Nothing matches these filters yet. Try another tab, category, or add one."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => {
            const hours = hoursByActivity[a.id] ?? 0;
            const style = categoryStyle(a.category);
            return (
              <Link
                key={a.id}
                href={`/activities/${a.id}`}
                className="group relative isolate overflow-hidden rounded-2xl border border-white/15 bg-card p-5 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-2xl transition-opacity duration-200 group-hover:opacity-50"
                  style={{ background: style.glow }}
                />
                <div className="relative flex items-start justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                  >
                    {a.category}
                  </span>
                  {a.ai_relevance_score != null && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {a.ai_relevance_score}% aligned
                    </span>
                  )}
                </div>
                <h3 className="relative mt-3 line-clamp-2 text-base font-semibold">
                  {a.name}
                </h3>
                {a.organization && (
                  <p className="relative mt-0.5 truncate text-xs text-muted-foreground">
                    {a.organization}
                  </p>
                )}
                <div className="relative mt-4 flex items-end justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(a.ai_skills ?? []).slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    {a.tracks_hours ? (
                      <>
                        <div className="text-lg font-semibold">
                          {hours.toFixed(1)}h
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          total
                        </div>
                      </>
                    ) : (
                      <div className="max-w-[9rem] text-xs font-medium text-muted-foreground">
                        {activityTimeLabel(a)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showNew && (
        <ActivityFormModal
          defaultStartGrade={gradeFilter === "All" ? undefined : gradeFilter}
          onClose={() => {
            setShowNew(false);
            router.replace("/activities");
          }}
        />
      )}
    </div>
  );
}
