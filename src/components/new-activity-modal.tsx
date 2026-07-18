"use client";

import { Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cloneElement, isValidElement, useId, useState } from "react";
import { toast } from "sonner";
import { createActivity } from "~/lib/actions";
import { ACTIVITY_CATEGORIES } from "~/lib/majors";

export function NewActivityModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Club" as string,
    organization: "",
    description: "",
    leadership_role: "",
    skills: "",
    start_date: "",
    end_date: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const created = await createActivity({
        name: form.name.trim(),
        category: form.category,
        organization: form.organization || null,
        description: form.description || null,
        leadershipRole: form.leadership_role || null,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startDate: form.start_date || null,
        endDate: form.end_date || null,
      });
      toast.success("Activity added. Analyzing…");
      router.push(`/activities/${created.id}`);
    } catch (err) {
      setSaving(false);
      toast.error(
        err instanceof Error ? err.message : "Failed to add activity",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New activity</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/50 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <Field label="Activity name">
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
            />
          </Field>
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
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {saving ? "Saving…" : "Save & analyze with AI"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
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
