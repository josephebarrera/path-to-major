"use client";

import { useMemo, useState } from "react";
import { MAJORS } from "~/lib/majors";

export function MajorPicker({
  selected,
  onChange,
  max = 3,
}: {
  selected: string[];
  onChange: (majors: string[]) => void;
  max?: number;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MAJORS;
    return MAJORS.filter((m) => m.toLowerCase().includes(q));
  }, [query]);

  const toggle = (major: string) => {
    if (selected.includes(major)) {
      onChange(selected.filter((m) => m !== major));
    } else if (selected.length < max) {
      onChange([...selected, major]);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search majors…"
        className="w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-white/10"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {selected.length}/{max} selected
      </p>
      <div className="mt-2 flex max-h-56 flex-wrap gap-2 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No majors match "{query}"
          </p>
        )}
        {filtered.map((major) => {
          const isSelected = selected.includes(major);
          const disabled = !isSelected && selected.length >= max;
          return (
            <button
              type="button"
              key={major}
              onClick={() => toggle(major)}
              disabled={disabled}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/60 text-foreground hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
              }`}
            >
              {major}
            </button>
          );
        })}
      </div>
    </div>
  );
}
