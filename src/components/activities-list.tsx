"use client";

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActivityFormModal } from "~/components/activity-form-modal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { activityTimeLabel, gradesForActivity } from "~/lib/dates";
import {
  ACTIVITY_CATEGORIES,
  categoryStyle,
  compareCategory,
} from "~/lib/majors";
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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleCollapsed(category: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const filtered = activities.filter(
    (a) =>
      (filter === "All" || a.category === filter) &&
      (gradeFilter === "All" || gradesForActivity(a).includes(gradeFilter)),
  );

  const grouped = Object.entries(
    filtered.reduce<Record<string, Activity[]>>((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    }, {}),
  ).sort(([a], [b]) => compareCategory(a, b));

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
          className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-medium text-[var(--lp-ink)] transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" /> Add activity
        </button>
      </div>

      <div className="flex gap-1 border border-white/12 bg-[var(--lp-ink)] p-1">
        {GRADE_TABS.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold transition ${
              gradeFilter === g
                ? "bg-white text-[var(--lp-ink)]"
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
            className={`px-3 py-1 text-xs font-medium transition ${
              filter === c
                ? "bg-white text-[var(--lp-ink)]"
                : "border border-white/12 bg-[var(--lp-ink)] text-muted-foreground hover:bg-white/10 hover:text-foreground"
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
        <div className="space-y-8">
          {grouped.map(([category, items]) => {
            const style = categoryStyle(category);
            const isOpen = !collapsed.has(category);
            return (
              <Collapsible
                key={category}
                open={isOpen}
                onOpenChange={() => toggleCollapsed(category)}
              >
                <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left transition data-[state=closed]:border data-[state=closed]:border-white/12 data-[state=closed]:bg-[var(--lp-ink)] data-[state=closed]:px-3 data-[state=closed]:py-2 data-[state=closed]:hover:border-white/25 data-[state=closed]:hover:bg-white/[0.06]">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: style.glow }}
                  />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    {category}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                  <span className="ml-auto p-1.5 transition-colors group-hover:bg-white/10">
                    <ChevronDown className="h-4 w-4 shrink-0 text-foreground transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="grid gap-3 pt-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        hours={hoursByActivity[a.id] ?? 0}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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

function ActivityCard({
  activity: a,
  hours,
}: {
  activity: Activity;
  hours: number;
}) {
  const style = categoryStyle(a.category);
  return (
    <Link
      href={`/activities/${a.id}`}
      className="group relative border border-white/12 bg-[var(--lp-ink)] p-5 transition duration-200 hover:border-white/25"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
        >
          {a.category}
        </span>
        {a.ai_relevance_score != null && (
          <span className="bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {a.ai_relevance_score}% aligned
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-base font-semibold">{a.name}</h3>
      {a.organization && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {a.organization}
        </p>
      )}
      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-wrap gap-1">
          {(a.ai_skills ?? []).slice(0, 3).map((s) => (
            <span
              key={s}
              className="bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="text-right">
          {a.tracks_hours ? (
            <>
              <div className="text-lg font-semibold">{hours.toFixed(1)}h</div>
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
}
