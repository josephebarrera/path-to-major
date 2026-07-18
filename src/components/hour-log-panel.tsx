"use client";

import { Clock, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { addHourLog, deleteHourLog } from "~/lib/actions";
import { formatLocalDate, todayLocalISO } from "~/lib/dates";
import type { Tables } from "~/lib/supabase/types";

type HourLog = Tables<"hour_logs">;

export function HourLogPanel({
  activityId,
  logs,
}: {
  activityId: string;
  logs: HourLog[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(todayLocalISO());
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(hours);
    if (!(h > 0)) return toast.error("Hours must be > 0");
    setSaving(true);
    try {
      await addHourLog({
        activityId,
        logDate: date,
        hours: h,
        note: note || null,
      });
      setHours("");
      setNote("");
      router.refresh();
      toast.success("Logged");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log hours");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (logId: string) => {
    setDeletingId(logId);
    try {
      await deleteHourLog(logId, activityId);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <h2 className="text-lg font-semibold">Hour log</h2>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
          />
          <input
            type="number"
            step="0.25"
            min="0.25"
            placeholder="Hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          maxLength={200}
          className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
        />
        <button
          type="submit"
          disabled={saving || !hours}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Log session
        </button>
      </form>

      <div className="mt-5 space-y-2">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No sessions logged yet.
          </p>
        ) : (
          logs.map((l) => (
            <div
              key={l.id}
              className="group flex items-start justify-between rounded-xl border border-white/60 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {Number(l.hours).toFixed(2)}h
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatLocalDate(l.log_date)}
                  </span>
                </div>
                {l.note && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {l.note}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(l.id)}
                disabled={deletingId === l.id}
                className="text-destructive opacity-0 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                aria-label="Delete log"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
