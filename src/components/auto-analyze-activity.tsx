"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { analyzeActivity } from "~/lib/ai";

export function AutoAnalyzeActivity({
  activityId,
  needsAnalysis,
}: {
  activityId: string;
  needsAnalysis: boolean;
}) {
  const router = useRouter();
  const triggered = useRef(false);

  useEffect(() => {
    if (!needsAnalysis || triggered.current) return;
    triggered.current = true;
    analyzeActivity(activityId)
      .then(() => router.refresh())
      .catch((err) => {
        toast.error(
          `AI analysis failed: ${err instanceof Error ? err.message : "unknown"}`,
        );
      });
  }, [activityId, needsAnalysis, router]);

  return null;
}
