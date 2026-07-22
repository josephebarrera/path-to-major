"use client";

import { ChevronDown, Search, ShieldCheck } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
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
import { categoryStyle, compareCategory, formatMajors } from "~/lib/majors";
import type { Tables } from "~/lib/supabase/types";

type Profile = Tables<"profiles">;
type Activity = Tables<"activities">;
type HourLog = Tables<"hour_logs">;

const CHART_GRID = "oklch(1 0 0 / 0.12)";
const CHART_TICK = { fontSize: 11, fill: "oklch(0.85 0.015 250)" };
const CHART_TOOLTIP = {
  background: "oklch(0.22 0.045 252)",
  border: "1px solid oklch(1 0 0 / 0.15)",
  borderRadius: 12,
  fontSize: 12,
  color: "oklch(0.95 0.01 250)",
};

export function AdminDashboard({
  profiles,
  activities,
  logs,
}: {
  profiles: Profile[];
  activities: Activity[];
  logs: HourLog[];
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(userId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  const totalUsers = profiles.length;
  const onboardedCount = profiles.filter((p) => p.onboarded).length;
  const totalActivities = activities.length;
  const totalHours = logs.reduce((s, l) => s + Number(l.hours), 0);

  const activityCountByUser = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of activities) m.set(a.user_id, (m.get(a.user_id) ?? 0) + 1);
    return m;
  }, [activities]);

  const hoursByUser = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of logs)
      m.set(l.user_id, (m.get(l.user_id) ?? 0) + Number(l.hours));
    return m;
  }, [logs]);

  const activitiesByUser = useMemo(() => {
    const m = new Map<string, Activity[]>();
    for (const a of activities) {
      const list = m.get(a.user_id);
      if (list) list.push(a);
      else m.set(a.user_id, [a]);
    }
    for (const list of m.values())
      list.sort(
        (a, b) =>
          compareCategory(a.category, b.category) ||
          a.name.localeCompare(b.name),
      );
    return m;
  }, [activities]);

  const usersWithAiFeedback = useMemo(() => {
    const s = new Set<string>();
    for (const a of activities) if (a.ai_analyzed_at) s.add(a.user_id);
    return s.size;
  }, [activities]);

  const pct = (n: number) =>
    totalUsers ? Math.round((n / totalUsers) * 100) : 0;

  const signupSeries = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const p of profiles) {
      const day = new Date(p.created_at).toISOString().slice(0, 10);
      byDate.set(day, (byDate.get(day) ?? 0) + 1);
    }
    const sorted = [...byDate.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    let acc = 0;
    return sorted.map(([date, n]) => {
      acc += n;
      return { date, users: acc };
    });
  }, [profiles]);

  const categoryData = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of activities) m.set(a.category, (m.get(a.category) ?? 0) + 1);
    return [...m.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  const majorData = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of profiles)
      for (const maj of p.intended_majors ?? [])
        m.set(maj, (m.get(maj) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.display_name ?? "").toLowerCase().includes(q),
    );
  }, [profiles, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <ShieldCheck className="h-4.5 w-4.5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Internal overview — visible only to admins.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Users" value={String(totalUsers)} />
        <Stat
          label="Onboarded"
          value={`${pct(onboardedCount)}%`}
          sub={`${onboardedCount} of ${totalUsers}`}
        />
        <Stat label="Activities" value={String(totalActivities)} />
        <Stat label="Hours logged" value={totalHours.toFixed(1)} />
        <Stat
          label="With AI feedback"
          value={`${pct(usersWithAiFeedback)}%`}
          sub={`${usersWithAiFeedback} of ${totalUsers}`}
        />
      </div>

      <div className="rounded-2xl border border-white/15 bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Signups over time</h2>
        <div className="mt-4 h-56">
          {signupSeries.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupSeries}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.72 0.17 220)"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.72 0.17 220)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="date" tick={CHART_TICK} />
                <YAxis tick={CHART_TICK} allowDecimals={false} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP}
                  labelStyle={{ color: "oklch(0.85 0.015 250)" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="oklch(0.78 0.16 210)"
                  strokeWidth={2.5}
                  fill="url(#ag)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/15 bg-card p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Activities by category</h2>
          <div className="mt-4 h-56">
            {categoryData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="category" tick={CHART_TICK} />
                  <YAxis tick={CHART_TICK} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "oklch(1 0 0 / 0.06)" }}
                    contentStyle={CHART_TOOLTIP}
                    labelStyle={{ color: "oklch(0.85 0.015 250)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.72 0.17 220)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-card p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Top intended majors</h2>
          {majorData.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {majorData.map(([major, count]) => (
                <li
                  key={major}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{major}</span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-card p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Users</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-64 rounded-full border border-border bg-white/10 py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-4 font-medium" />
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Grade</th>
                <th className="pb-2 pr-4 font-medium">Majors</th>
                <th className="pb-2 pr-4 font-medium">Onboarded</th>
                <th className="pb-2 pr-4 font-medium">Activities</th>
                <th className="pb-2 pr-4 font-medium">Hours</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p) => {
                const userActivities = activitiesByUser.get(p.id) ?? [];
                const isOpen = expanded.has(p.id);
                return (
                  <Fragment key={p.id}>
                    <tr
                      onClick={() =>
                        userActivities.length && toggleExpanded(p.id)
                      }
                      className={`border-b border-white/5 ${
                        userActivities.length
                          ? "cursor-pointer hover:bg-white/5"
                          : ""
                      }`}
                    >
                      <td className="py-2.5 pl-1">
                        {userActivities.length > 0 && (
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                              isOpen ? "" : "-rotate-90"
                            }`}
                          />
                        )}
                      </td>
                      <td className="py-2.5 pr-4 font-medium">
                        {p.display_name || "—"}
                        {p.is_admin && (
                          <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.email || "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.grade_level ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {formatMajors(p.intended_majors) || "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.onboarded ? "Yes" : "No"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {activityCountByUser.get(p.id) ?? 0}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {(hoursByUser.get(p.id) ?? 0).toFixed(1)}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                    {isOpen && userActivities.length > 0 && (
                      <tr className="border-b border-white/5">
                        <td colSpan={9} className="bg-white/[0.03] px-4 py-3">
                          <div className="flex flex-col gap-2">
                            {userActivities.map((a) => {
                              const style = categoryStyle(a.category);
                              return (
                                <div
                                  key={a.id}
                                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                                >
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                                  >
                                    {a.category}
                                  </span>
                                  <span className="font-medium">{a.name}</span>
                                  {a.organization && (
                                    <span className="text-muted-foreground">
                                      · {a.organization}
                                    </span>
                                  )}
                                  {a.ai_relevance_score != null && (
                                    <span className="text-xs text-muted-foreground">
                                      {a.ai_relevance_score}% aligned
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-card p-5 shadow-lg">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Not enough data yet.
    </div>
  );
}
