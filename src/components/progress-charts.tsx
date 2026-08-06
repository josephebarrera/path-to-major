"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toLocalISO } from "~/lib/dates";
import type { Tables } from "~/lib/supabase/types";

type Activity = Tables<"activities">;
type HourLog = Tables<"hour_logs">;

export function ProgressCharts({
  intendedMajor,
  activities,
  logs,
}: {
  intendedMajor: string | null;
  activities: Activity[];
  logs: HourLog[];
}) {
  const [range, setRange] = useState<"all" | "90" | "30">("all");

  const activityMap = useMemo(
    () => new Map(activities.map((a) => [a.id, a])),
    [activities],
  );

  const filteredLogs = useMemo(() => {
    if (range === "all") return logs;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(range));
    const cutoffISO = toLocalISO(cutoff);
    return logs.filter((l) => l.log_date >= cutoffISO);
  }, [logs, range]);

  const cumulativeSeries = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const l of filteredLogs)
      byDate.set(l.log_date, (byDate.get(l.log_date) ?? 0) + Number(l.hours));
    const sorted = [...byDate.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    let acc = 0;
    return sorted.map(([date, h]) => {
      acc += h;
      return { date, hours: Number(acc.toFixed(2)) };
    });
  }, [filteredLogs]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of filteredLogs) {
      const a = activityMap.get(l.activity_id);
      if (!a) continue;
      m.set(a.category, (m.get(a.category) ?? 0) + Number(l.hours));
    }
    return [...m.entries()].map(([category, hours]) => ({
      category,
      hours: Number(hours.toFixed(2)),
    }));
  }, [filteredLogs, activityMap]);

  const skillCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of activities)
      for (const s of a.ai_skills ?? []) m.set(s, (m.get(s) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [activities]);

  const totalHours = filteredLogs.reduce((s, l) => s + Number(l.hours), 0);
  const analyzed = activities.filter((a) => a.ai_relevance_score != null);
  const avgAlignment = analyzed.length
    ? Math.round(
        analyzed.reduce((s, a) => s + (a.ai_relevance_score ?? 0), 0) /
          analyzed.length,
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your growth toward {intendedMajor ?? "your goals"}.
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-card p-1">
          {(["all", "90", "30"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                range === r
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {r === "all" ? "All time" : `Last ${r} days`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total hours" value={totalHours.toFixed(1)} />
        <Stat
          label="Major alignment"
          value={avgAlignment ? `${avgAlignment}%` : "—"}
        />
        <Stat label="Activities" value={String(activities.length)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Cumulative hours</h2>
        <div className="mt-4 h-64">
          {cumulativeSeries.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Log hours to see your progress chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeSeries}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#14161a"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="100%"
                      stopColor="#14161a"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(20, 22, 26, 0.12)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "rgba(20, 22, 26, 0.6)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "rgba(20, 22, 26, 0.6)" }} />
                <Tooltip
                  contentStyle={{
                    background: "#fafaf7",
                    border: "1px solid rgba(20, 22, 26, 0.4)",
                    borderRadius: 0,
                    fontSize: 12,
                    color: "#14161a",
                  }}
                  labelStyle={{ color: "rgba(20, 22, 26, 0.6)" }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#14161a"
                  strokeWidth={2.5}
                  fill="url(#hg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Hours by category</h2>
          <div className="mt-4 h-64">
            {byCategory.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(20, 22, 26, 0.12)"
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "rgba(20, 22, 26, 0.6)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(20, 22, 26, 0.6)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(20, 22, 26, 0.05)" }}
                    contentStyle={{
                      background: "#fafaf7",
                      border: "1px solid rgba(20, 22, 26, 0.4)",
                      borderRadius: 0,
                      fontSize: 12,
                      color: "#14161a",
                    }}
                    labelStyle={{ color: "rgba(20, 22, 26, 0.6)" }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#14161a"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Skills you're developing</h2>
          {skillCounts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Add activities to see the skills you're building.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {skillCounts.map(([s, n]) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-transparent px-3 py-1 text-xs"
                  style={{ fontSize: `${Math.min(14, 11 + n)}px` }}
                >
                  {s} <span className="text-muted-foreground">× {n}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}
