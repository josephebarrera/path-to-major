"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { markTourSeen } from "~/lib/actions";

type Placement = "right" | "bottom";

const STEPS: {
  target: string;
  title: string;
  body: string;
  placement: Placement;
}[] = [
  {
    target: "sidebar-nav",
    title: "Get around",
    body: "Jump between Activities, Recommendations, Progress, Profile, and Settings anytime from here.",
    placement: "right",
  },
  {
    target: "add-activity",
    title: "Add your first activity",
    body: "Log an extracurricular, job, or project here to get instant AI feedback on how it supports your major.",
    placement: "bottom",
  },
  {
    target: "kpi-cards",
    title: "Track your progress",
    body: "Your major alignment score, hours logged, and activity count update automatically as you add more.",
    placement: "bottom",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function measure(selector: string): Rect | null {
  const el = document.querySelector(`[data-tour="${selector}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function DashboardTour({ hasSeenTour }: { hasSeenTour: boolean }) {
  const [active, setActive] = useState(!hasSeenTour);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = STEPS[stepIndex];

  const finish = useCallback(() => {
    setActive(false);
    markTourSeen().catch(() => {
      // Non-critical: worst case the tour shows again next visit.
    });
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
  }, []);

  useEffect(() => {
    if (!active || !step) return;

    // Deferred past mount/step-change so layout has settled before deciding
    // a target is genuinely missing (e.g. the desktop sidebar nav hidden on
    // mobile) versus just not painted yet. A plain macrotask (not rAF) so
    // this doesn't depend on the tab actually being visible/compositing.
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      const measured = measure(step.target);
      if (measured) {
        setRect(measured);
      } else if (stepIndex < STEPS.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        finish();
      }
    }, 0);

    const recompute = () => setRect(measure(step.target));
    window.addEventListener("resize", recompute);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("resize", recompute);
    };
  }, [active, step, stepIndex, finish]);

  const cardPos = useMemo(() => {
    if (!rect || !step) return null;
    const margin = 14;
    const cardWidth = 300;
    if (step.placement === "right") {
      return {
        top: Math.min(
          Math.max(rect.top, margin),
          window.innerHeight - 220 - margin,
        ),
        left: rect.left + rect.width + margin,
      };
    }
    const top = rect.top + rect.height + margin;
    const left = Math.min(
      Math.max(rect.left, margin),
      window.innerWidth - cardWidth - margin,
    );
    return { top, left };
  }, [rect, step]);

  if (!active || !step || !rect || !cardPos) return null;

  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <>
      <div
        className="p2m-tour-highlight"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
      />
      <div
        className="p2m-tour-card"
        style={{ top: cardPos.top, left: cardPos.left }}
      >
        <div className="p2m-tour-step">
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        <div className="p2m-tour-title">{step.title}</div>
        <p className="p2m-tour-body">{step.body}</p>
        <div className="p2m-tour-actions">
          <button type="button" onClick={finish} className="p2m-tour-skip">
            Skip
          </button>
          <button
            type="button"
            onClick={isLastStep ? finish : next}
            className="p2m-tour-next"
          >
            {isLastStep ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
