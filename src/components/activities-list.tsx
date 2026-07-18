"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NewActivityModal } from "~/components/new-activity-modal";
import { ACTIVITY_CATEGORIES } from "~/lib/majors";
import type { Tables } from "~/lib/supabase/types";

type Activity = Tables<"activities">;

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
  const [showNew, setShowNew] = useState(openNewDefault);

  const filtered = activities.filter(
    (a) => filter === "All" || a.category === filter,
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

      <div className="flex flex-wrap gap-2">
        {(["All", ...ACTIVITY_CATEGORIES] as const).map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === c
                ? "bg-primary text-primary-foreground"
                : "bg-white/60 text-muted-foreground hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-sm font-medium">No activities here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "All"
              ? "Add your first activity to get personalized AI feedback."
              : `Nothing in ${filter} yet. Try another category or add one.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => {
            const hours = hoursByActivity[a.id] ?? 0;
            return (
              <Link
                key={a.id}
                href={`/activities/${a.id}`}
                className="glass-panel group p-5 transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
                    {a.category}
                  </span>
                  {a.ai_relevance_score != null && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {a.ai_relevance_score}% aligned
                    </span>
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-semibold">
                  {a.name}
                </h3>
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
                        className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-muted-foreground dark:bg-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {hours.toFixed(1)}h
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      total
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showNew && (
        <NewActivityModal
          onClose={() => {
            setShowNew(false);
            router.replace("/activities");
          }}
        />
      )}
    </div>
  );
}
