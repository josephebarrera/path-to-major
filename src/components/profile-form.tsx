"use client";

import { cloneElement, isValidElement, useId, useState } from "react";
import { toast } from "sonner";
import { MajorPicker } from "~/components/major-picker";
import { updateProfile } from "~/lib/actions";

export function ProfileForm({
  initialName,
  initialGrade,
  initialMajors,
  initialExploring,
}: {
  initialName: string;
  initialGrade: number;
  initialMajors: string[];
  initialExploring: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [grade, setGrade] = useState(initialGrade);
  const [majors, setMajors] = useState<string[]>(initialMajors);
  const [exploring, setExploring] = useState(initialExploring);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: name,
        gradeLevel: grade,
        intendedMajors: majors,
        exploring,
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your goals up to date.
        </p>
      </div>

      <div className="glass-panel space-y-4 p-6">
        <Row label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
          />
        </Row>
        <Row label="Grade">
          <div className="grid grid-cols-4 gap-2">
            {[9, 10, 11, 12].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGrade(g)}
                className={`rounded-xl border py-2 text-sm font-medium transition ${
                  grade === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/60 text-foreground dark:bg-white/10"
                }`}
              >
                {g}th
              </button>
            ))}
          </div>
        </Row>
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Intended majors
          </span>
          <MajorPicker selected={majors} onChange={setMajors} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={exploring}
            onChange={(e) => setExploring(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          I'm still exploring multiple majors
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {isValidElement(children)
        ? cloneElement(children, { id } as never)
        : children}
    </label>
  );
}
