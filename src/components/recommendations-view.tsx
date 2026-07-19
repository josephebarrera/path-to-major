"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getRecommendations } from "~/lib/ai";

type Recommendation = {
  title: string;
  why: string;
  category: string;
  effort: "low" | "medium" | "high";
};

export function RecommendationsView({
  intendedMajor,
  initialRecommendations,
}: {
  intendedMajor: string | null;
  initialRecommendations: Recommendation[];
}) {
  const [recommendations, setRecommendations] = useState(
    initialRecommendations,
  );
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setRecommendations(await getRecommendations());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Recommendations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Next steps tailored to {intendedMajor ?? "your major"}.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-card px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-card p-8 text-sm text-muted-foreground shadow-lg">
          No recommendations yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations.map((r) => (
            <div
              key={`${r.category}-${r.title}`}
              className="rounded-2xl border border-white/15 bg-card p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
                  {r.category}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    r.effort === "low"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : r.effort === "high"
                        ? "bg-orange-500/10 text-orange-700"
                        : "bg-sky-500/10 text-sky-700"
                  }`}
                >
                  {r.effort} effort
                </span>
              </div>
              <h3 className="mt-3 flex items-start gap-2 text-base font-semibold">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {r.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.why}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
