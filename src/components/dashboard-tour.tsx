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

// Rough estimate of the card's rendered height, used only to decide whether
// it fits below/beside the target or needs to flip to the other side —
// doesn't need to be exact, just close enough that the card never ends up
// pushed below the fold on a short mobile viewport.
const CARD_HEIGHT_ESTIMATE = 200;
const CARD_WIDTH = 300;
const MARGIN = 14;

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

    let cancelled = false;

    const tryMeasure = () => {
      if (cancelled) return;
      const measured = measure(step.target);
      if (measured) {
        setRect(measured);
      } else if (stepIndex < STEPS.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        finish();
      }
    };

    // A short delay rather than 0ms or requestAnimationFrame: rAF only
    // fires when the tab is actually compositing frames, which mobile
    // browsers can pause or throttle for a backgrounded/inactive tab —
    // exactly the kind of edge case (switching apps mid-onboarding, a slow
    // initial paint) that would make the tour silently never appear. A
    // plain timer still runs regardless, and 80ms is enough for a real
    // layout pass to have settled first.
    const timer = setTimeout(tryMeasure, 80);

    const recompute = () => setRect(measure(step.target));
    window.addEventListener("resize", recompute);
    // Mobile browsers show/hide their address bar on scroll, which changes
    // the visible viewport without always firing a "resize" event — scroll
    // is a cheap extra signal to catch that and re-anchor the highlight.
    window.addEventListener("scroll", recompute, { passive: true });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute);
    };
  }, [active, step, stepIndex, finish]);

  const cardPos = useMemo(() => {
    if (!rect || !step) return null;
    const cardWidth = Math.min(CARD_WIDTH, window.innerWidth - MARGIN * 2);
    const viewportH = window.innerHeight;

    if (step.placement === "right") {
      const fitsRight =
        rect.left + rect.width + MARGIN + cardWidth <= window.innerWidth;
      if (fitsRight) {
        return {
          top: Math.min(
            Math.max(rect.top, MARGIN),
            viewportH - CARD_HEIGHT_ESTIMATE - MARGIN,
          ),
          left: rect.left + rect.width + MARGIN,
          width: cardWidth,
        };
      }
      // Not enough horizontal room (e.g. a narrow phone) — fall through to
      // the same above/below stacking logic "bottom" placement uses,
      // instead of pushing the card off the right edge of the screen.
    }

    const left = Math.min(
      Math.max(rect.left, MARGIN),
      window.innerWidth - cardWidth - MARGIN,
    );
    const spaceBelow = viewportH - (rect.top + rect.height + MARGIN);
    // Show the card below the target if it fits; otherwise flip it above.
    // The old version always placed it below with no viewport check, which
    // is exactly what pushed it past the bottom of the screen on mobile.
    const top =
      spaceBelow >= CARD_HEIGHT_ESTIMATE
        ? rect.top + rect.height + MARGIN
        : Math.max(rect.top - CARD_HEIGHT_ESTIMATE - MARGIN, MARGIN);
    return { top, left, width: cardWidth };
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
        style={{ top: cardPos.top, left: cardPos.left, width: cardPos.width }}
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
