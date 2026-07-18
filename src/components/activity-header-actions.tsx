"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteActivity } from "~/lib/actions";
import { analyzeActivity } from "~/lib/ai";

export function ActivityHeaderActions({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reanalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeActivity(activityId);
      router.refresh();
      toast.success("Re-analyzed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this activity and all its hour logs?")) return;
    setDeleting(true);
    try {
      await deleteActivity(activityId);
      toast.success("Deleted");
      router.push("/activities");
    } catch (err) {
      setDeleting(false);
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={reanalyze}
        disabled={analyzing}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm hover:bg-white disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/20"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${analyzing ? "animate-spin" : ""}`}
        />
        Re-analyze
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-white/70 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50 dark:bg-white/10"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>
  );
}
