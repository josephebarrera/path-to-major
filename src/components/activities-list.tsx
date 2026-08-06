"use client";

import { ChevronDown, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ActivityFormModal } from "~/components/activity-form-modal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { analyzeActivity } from "~/lib/ai";
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
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState({ done: 0, total: 0 });

  const unanalyzed = activities.filter((a) => !a.ai_analyzed_at);

  async function analyzeAll() {
    setAnalyzingAll(true);
    setAnalyzeProgress({ done: 0, total: unanalyzed.length });
    let succeeded = 0;
    try {
      for (const a of unanalyzed) {
        await analyzeActivity(a.id);
        succeeded += 1;
        setAnalyzeProgress((p) => ({ ...p, done: p.done + 1 }));
      }
      toast.success(`Analyzed ${succeeded} activities`);
    } catch (err) {
      toast.error(
        `Stopped after ${succeeded} of ${unanalyzed.length}: ${
          err instanceof Error ? err.message : "analysis failed"
        }`,
      );
    } finally {
      setAnalyzingAll(false);
      router.refresh();
    }
  }

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
        <div className="flex items-center gap-2">
          {unanalyzed.length > 0 && (
            <button
              type="button"
              onClick={analyzeAll}
              disabled={analyzingAll}
              className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-secondary disabled:opacity-50"
            >
              <Sparkles
                className={`h-4 w-4 ${analyzingAll ? "animate-pulse" : ""}`}
              />
              {analyzingAll
                ? `Analyzing ${analyzeProgress.done}/${analyzeProgress.total}…`
                : `Analyze ${unanalyzed.length} unrated`}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add activity
          </button>
        </div>
      </div>

      <div className="flex gap-1 rounded-full border border-border bg-card p-1">
        {GRADE_TABS.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              gradeFilter === g
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
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
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border p-12 text-center">
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
                <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg text-left transition data-[state=closed]:border data-[state=closed]:border-border data-[state=closed]:bg-card data-[state=closed]:px-3 data-[state=closed]:py-2 data-[state=closed]:hover:border-foreground data-[state=closed]:hover:bg-foreground/5">
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
                  <span className="ml-auto rounded-full p-1.5 transition-colors group-hover:bg-foreground/5">
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
      className="group rounded-2xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-1 hover:border-foreground"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
        >
          {a.category}
        </span>
        {a.ai_relevance_score != null && (
          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground">
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
              className="border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
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
