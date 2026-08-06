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
        className="p2m-auth-input"
      />
      <p className="p2m-major-count">
        {selected.length}/{max} selected
      </p>
      <div className="p2m-major-list">
        {filtered.length === 0 && (
          <p className="p2m-major-empty">No majors match "{query}"</p>
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
              className={`p2m-major-chip ${isSelected ? "is-selected" : ""}`}
            >
              {major}
            </button>
          );
        })}
      </div>
    </div>
  );
}
