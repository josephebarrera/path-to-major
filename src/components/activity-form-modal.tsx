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
  onClose,
}: {
  activity?: Activity;
  onClose: () => void;
}) {
  const router = useRouter();
  const editing = !!activity;
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: activity?.name ?? "",
    category: activity?.category ?? ("Club" as string),
    organization: activity?.organization ?? "",
    description: activity?.description ?? "",
    leadership_role: activity?.leadership_role ?? "",
    skills: activity?.skills?.join(", ") ?? "",
    start_date: activity?.start_date ?? "",
    end_date: activity?.end_date ?? "",
    start_grade: activity?.start_grade ? String(activity.start_grade) : "",
    end_grade: activity?.end_grade ? String(activity.end_grade) : "",
    tracks_hours: activity?.tracks_hours ?? true,
    time_commitment: activity?.time_commitment ?? "",
  });
  const [useGradeRange, setUseGradeRange] = useState(!!activity?.start_grade);

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
    setSaving(true);
    try {
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
        startDate: useGradeRange ? null : form.start_date || null,
        endDate: useGradeRange ? null : form.end_date || null,
        startGrade:
          useGradeRange && form.start_grade ? Number(form.start_grade) : null,
        endGrade:
          useGradeRange && form.end_grade ? Number(form.end_grade) : null,
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
      <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editing ? "Edit activity" : "New activity"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/50 dark:hover:bg-white/10"
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
              className={`w-full rounded-xl border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10 ${
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
                className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
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
                className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
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
              className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
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
              className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
            />
          </Field>
          <Field label="Skills learned (comma separated)">
            <input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="e.g. programming, teamwork, public speaking"
              className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
            />
          </Field>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {useGradeRange ? "Grade range" : "Dates"}
            </span>
            <button
              type="button"
              onClick={() => setUseGradeRange(!useGradeRange)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {useGradeRange
                ? "Use exact dates instead"
                : "Use grade level instead"}
            </button>
          </div>
          {useGradeRange ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Started in">
                <select
                  value={form.start_grade}
                  onChange={(e) =>
                    setForm({ ...form, start_grade: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
                >
                  <option value="">Select grade</option>
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
                  className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
                >
                  <option value="">Still doing this / N/A</option>
                  <option value="9">9th grade</option>
                  <option value="10">10th grade</option>
                  <option value="11">11th grade</option>
                  <option value="12">12th grade</option>
                </select>
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
                />
              </Field>
              <Field label="End (optional)">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
                />
              </Field>
            </div>
          )}
          {useGradeRange && (
            <p className="-mt-1 text-xs text-muted-foreground">
              For activities with no fixed dates, like a sport you play every
              year.
            </p>
          )}
          <label className="flex items-start gap-2.5 rounded-xl border border-border bg-white/80 px-3 py-2.5 text-sm dark:bg-white/10">
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
                className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
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
