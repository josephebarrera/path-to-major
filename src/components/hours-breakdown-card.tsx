"use client";

import { ChevronDown, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NumberTicker } from "~/components/ui/number-ticker";
import { categoryStyle } from "~/lib/majors";

export function HoursBreakdownCard({
  totalHours,
  sessionCount,
  breakdown,
}: {
  totalHours: number;
  sessionCount: number;
  breakdown: { id: string; name: string; category: string; hours: number }[];
}) {
  const [open, setOpen] = useState(false);
  const hasBreakdown = breakdown.length > 0;

  return (
    <div className="hierarchy-stat-card p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!hasBreakdown}
        className="flex w-full items-center justify-between gap-2 text-left disabled:cursor-default"
      >
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-white">
          <span className="grid h-8 w-8 place-items-center bg-white/10 text-white">
            <Clock className="h-4 w-4" />
          </span>
          Total hours
        </div>
        {hasBreakdown && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--lp-text-muted)] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
      <div className="mt-3 text-3xl font-semibold text-[var(--lp-blue-floor)]">
        <NumberTicker value={totalHours} decimalPlaces={1} />
      </div>
      <div className="mt-1 text-xs text-white">
        {sessionCount} sessions logged
      </div>

      {open && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
          {breakdown.map((a) => {
            const style = categoryStyle(a.category);
            return (
              <Link
                key={a.id}
                href={`/activities/${a.id}`}
                className="flex items-center gap-2.5 border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: style.glow }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {a.name}
                </span>
                <span className="shrink-0 text-sm font-semibold text-foreground/90">
                  {a.hours.toFixed(1)}h
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
