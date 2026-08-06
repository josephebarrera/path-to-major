"use client";

import { ArrowRight } from "lucide-react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MajorPicker } from "~/components/major-picker";
import { completeOnboarding } from "~/lib/actions";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [grade, setGrade] = useState<number>(10);
  const [majors, setMajors] = useState<string[]>([]);
  const [exploring, setExploring] = useState(false);
  const [name, setName] = useState(initialName);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    if (majors.length === 0 && !exploring)
      return toast.error(
        "Pick at least one intended major, or check that you're still exploring",
      );
    setLoading(true);
    try {
      await completeOnboarding({
        displayName: name,
        gradeLevel: grade,
        intendedMajors: majors,
        exploring,
      });
      toast.success("You're all set!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className={`p2m-auth ${poppins.className}`}>
      <div className="p2m-auth-wrap">
        <div className="p2m-auth-brand">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="none" aria-hidden="true">
            <path
              d="M4 26 L12 18 L20 20 L28 6"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="4" cy="26" r="2.3" fill="currentColor" />
            <circle cx="12" cy="18" r="2.3" fill="currentColor" />
            <circle cx="20" cy="20" r="2.3" fill="currentColor" />
            <circle cx="28" cy="6" r="3" fill="currentColor" />
          </svg>
          PathToMajor
        </div>

        <div className="p2m-auth-card">
          <div className="p2m-auth-progress">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`p2m-auth-progress-seg ${i <= step ? "is-active" : ""}`}
              />
            ))}
          </div>

          {step === 0 && (
            <>
              <h1 className="p2m-auth-title">What should we call you?</h1>
              <p className="p2m-auth-sub">
                We'll use this to personalize your dashboard.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="p2m-auth-input"
                style={{ marginTop: 20 }}
              />
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!name.trim()}
                className="p2m-auth-btn p2m-auth-btn-solid"
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="p2m-auth-title">What grade are you in?</h1>
              <p className="p2m-auth-sub">
                So we can tailor guidance for your stage of high school.
              </p>
              <div className="p2m-auth-grade-grid">
                {[9, 10, 11, 12].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`p2m-auth-grade-btn ${grade === g ? "is-selected" : ""}`}
                  >
                    {g}th
                  </button>
                ))}
              </div>
              <div className="p2m-auth-row">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="p2m-auth-btn p2m-auth-btn-ghost"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="p2m-auth-btn p2m-auth-btn-solid"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="p2m-auth-title">What do you want to study?</h1>
              <p className="p2m-auth-sub">
                Pick up to 3, or skip this if you're still exploring. You can
                change these anytime.
              </p>
              <div style={{ marginTop: 20 }}>
                <MajorPicker selected={majors} onChange={setMajors} />
              </div>

              <label className="p2m-auth-checkbox-row">
                <input
                  type="checkbox"
                  checked={exploring}
                  onChange={(e) => setExploring(e.target.checked)}
                />
                I'm still exploring multiple majors
              </label>

              <div className="p2m-auth-row">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p2m-auth-btn p2m-auth-btn-ghost"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={finish}
                  disabled={loading}
                  className="p2m-auth-btn p2m-auth-btn-solid"
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
