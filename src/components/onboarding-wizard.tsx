"use client";

import { ArrowRight, Compass } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MajorPicker } from "~/components/major-picker";
import { completeOnboarding } from "~/lib/actions";

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const [grade, setGrade] = useState<number>(10);
  const [majors, setMajors] = useState<string[]>([]);
  const [exploring, setExploring] = useState(false);
  const [name, setName] = useState(initialName);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    if (majors.length === 0)
      return toast.error("Pick at least one intended major");
    setLoading(true);
    try {
      await completeOnboarding({
        displayName: name,
        gradeLevel: grade,
        intendedMajors: majors,
        exploring,
      });
      toast.success("You're all set!");
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </span>
          PathToMajor
        </div>

        <div className="glass-panel p-8">
          <div className="mb-6 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  i <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <>
              <h1 className="text-2xl font-semibold">
                What should we call you?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll use this to personalize your dashboard.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-5 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
              />
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!name.trim()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-2xl font-semibold">What grade are you in?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                So we can tailor guidance for your stage of high school.
              </p>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[9, 10, 11, 12].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`rounded-xl border py-4 text-sm font-medium transition ${
                      grade === g
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white/60 text-foreground hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                    }`}
                  >
                    {g}th
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 rounded-full border border-border bg-white/60 py-2.5 text-sm text-foreground dark:bg-white/10"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-semibold">
                What do you want to study?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick up to 3. You can change these anytime.
              </p>
              <div className="mt-5">
                <MajorPicker selected={majors} onChange={setMajors} />
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exploring}
                  onChange={(e) => setExploring(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                I'm still exploring multiple majors
              </label>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-full border border-border bg-white/60 py-2.5 text-sm text-foreground dark:bg-white/10"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={finish}
                  disabled={loading || majors.length === 0}
                  className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {loading ? "…" : "Get started"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
