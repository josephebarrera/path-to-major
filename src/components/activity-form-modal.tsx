"use client";

import { Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { createActivity, updateActivity } from "~/lib/actions";
import { ACTIVITY_CATEGORIES } from "~/lib/majors";
import type { Tables } from "~/lib/supabase/types";

type Activity = Tables<"activities">;

export function ActivityFormModal({
  activity,
  defaultStartGrade,
  onClose,
}: {
  activity?: Activity;
  defaultStartGrade?: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const editing = !!activity;
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const gradeRef = useRef<HTMLSelectElement>(null);
  const [form, setForm] = useState({
    name: activity?.name ?? "",
    category: activity?.category ?? ("Club" as string),
    organization: activity?.organization ?? "",
    description: activity?.description ?? "",
    leadership_role: activity?.leadership_role ?? "",
    skills: activity?.skills?.join(", ") ?? "",
    start_date: activity?.start_date ?? "",
    end_date: activity?.end_date ?? "",
    start_grade: activity?.started_before_hs
      ? "pre"
      : activity?.start_grade
        ? String(activity.start_grade)
        : defaultStartGrade
          ? String(defaultStartGrade)
          : "",
    end_grade: activity?.end_grade ? String(activity.end_grade) : "",
    is_summer: activity?.is_summer ?? false,
    tracks_hours: activity?.tracks_hours ?? true,
    time_commitment: activity?.time_commitment ?? "",
  });
  const [showDates, setShowDates] = useState(
    !!(activity?.start_date || activity?.end_date),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError(
        "Enter a name for this activity so we know what to call it.",
      );
      nameRef.current?.focus();
      return;
    }
    setNameError(null);
    if (!form.start_grade) {
      setGradeError("Pick the grade you started this activity in.");
      gradeRef.current?.focus();
      return;
    }
    setGradeError(null);
    setSaving(true);
    try {
      const startedBeforeHs = form.start_grade === "pre";
      const numericStartGrade = startedBeforeHs ? 9 : Number(form.start_grade);
      const payload = {
        name: form.name.trim(),
        category: form.category,
        organization: form.organization || null,
        description: form.description || null,
        leadershipRole: form.leadership_role || null,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startDate: showDates ? form.start_date || null : null,
        endDate: showDates ? form.end_date || null : null,
        startGrade: numericStartGrade,
        endGrade: form.is_summer
          ? numericStartGrade < 12
            ? numericStartGrade + 1
            : null
          : form.end_grade
            ? Number(form.end_grade)
            : null,
        isSummer: form.is_summer,
        startedBeforeHs,
        tracksHours: form.tracks_hours,
        timeCommitment: form.tracks_hours
          ? null
          : form.time_commitment.trim() || null,
      };
      if (editing) {
        await updateActivity(activity.id, payload);
        toast.success("Activity updated");
        router.refresh();
        onClose();
      } else {
        const created = await createActivity(payload);
        toast.success("Activity added. Analyzing…");
        router.push(`/activities/${created.id}`);
      }
    } catch (err) {
      setSaving(false);
      toast.error(
        err instanceof Error ? err.message : "Failed to save activity",
      );
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="glass-panel-navy max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editing ? "Edit activity" : "New activity"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <Field label="Activity name" required>
            <input
              ref={nameRef}
              maxLength={120}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (nameError) setNameError(null);
              }}
              aria-invalid={nameError ? true : undefined}
              className={`w-full rounded-xl border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring ${
                nameError ? "border-destructive" : "border-border"
              }`}
            />
          </Field>
          {nameError && (
            <p className="-mt-2 text-xs text-destructive">{nameError}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Organization">
              <input
                maxLength={120}
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>
          <Field label="Leadership role (optional)">
            <input
              maxLength={80}
              value={form.leadership_role}
              onChange={(e) =>
                setForm({ ...form, leadership_role: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              maxLength={1000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What do you do in this activity?"
              className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Skills learned (comma separated)">
            <input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="e.g. programming, teamwork, public speaking"
              className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <label className="flex items-start gap-2.5 rounded-xl border border-border bg-white/10 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.is_summer}
              onChange={(e) =>
                setForm({ ...form, is_summer: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span>
              <span className="block font-medium text-foreground">
                This was a summer program
              </span>
              <span className="block text-xs text-muted-foreground">
                Happened between school years rather than during one, like a
                summer internship.
              </span>
            </span>
          </label>
          {form.is_summer ? (
            <Field label="Summer after" required>
              <select
                ref={gradeRef}
                value={form.start_grade}
                onChange={(e) => {
                  setForm({ ...form, start_grade: e.target.value });
                  if (gradeError) setGradeError(null);
                }}
                className={`w-full rounded-xl border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring ${
                  gradeError ? "border-destructive" : "border-border"
                }`}
              >
                <option value="">Select grade</option>
                <option value="pre">Before 9th grade</option>
                <option value="9">9th grade</option>
                <option value="10">10th grade</option>
                <option value="11">11th grade</option>
                <option value="12">12th grade</option>
              </select>
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Started in" required>
                <select
                  ref={gradeRef}
                  value={form.start_grade}
                  onChange={(e) => {
                    setForm({ ...form, start_grade: e.target.value });
                    if (gradeError) setGradeError(null);
                  }}
                  className={`w-full rounded-xl border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring ${
                    gradeError ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="">Select grade</option>
                  <option value="pre">Before 9th grade</option>
                  <option value="9">9th grade</option>
                  <option value="10">10th grade</option>
                  <option value="11">11th grade</option>
                  <option value="12">12th grade</option>
                </select>
              </Field>
              <Field label="Through (optional)">
                <select
                  value={form.end_grade}
                  onChange={(e) =>
                    setForm({ ...form, end_grade: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Still doing this</option>
                  <option value="9">9th grade</option>
                  <option value="10">10th grade</option>
                  <option value="11">11th grade</option>
                  <option value="12">12th grade</option>
                </select>
              </Field>
            </div>
          )}
          {gradeError && (
            <p className="-mt-2 text-xs text-destructive">{gradeError}</p>
          )}
          {showDates ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <Field label="End date (optional)">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDates(true)}
              className="text-left text-xs font-medium text-primary hover:underline"
            >
              + Add exact start/end dates
            </button>
          )}
          <label className="flex items-start gap-2.5 rounded-xl border border-border bg-white/10 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={!form.tracks_hours}
              onChange={(e) =>
                setForm({ ...form, tracks_hours: !e.target.checked })
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span>
              <span className="block font-medium text-foreground">
                I won't be tracking hours for this
              </span>
              <span className="block text-xs text-muted-foreground">
                For programs with a set length instead of a set hour count, like
                a 6-week summer program.
              </span>
            </span>
          </label>
          {!form.tracks_hours && (
            <Field label="Time commitment (optional)">
              <input
                maxLength={80}
                value={form.time_commitment}
                onChange={(e) =>
                  setForm({ ...form, time_commitment: e.target.value })
                }
                placeholder="e.g. 6-week summer program"
                className="w-full rounded-xl border border-border bg-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          )}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {saving
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Save & analyze with AI"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {isValidElement(children)
        ? cloneElement(children, { id } as never)
        : children}
    </label>
  );
}
