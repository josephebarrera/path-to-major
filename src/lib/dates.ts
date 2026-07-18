export function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayLocalISO(): string {
  return toLocalISO(new Date());
}

export function formatLocalDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const GRADE_ORDINAL: Record<number, string> = {
  9: "9th",
  10: "10th",
  11: "11th",
  12: "12th",
};

export function gradeRangeLabel(
  startGrade: number,
  endGrade: number | null,
): string {
  const start = GRADE_ORDINAL[startGrade] ?? `${startGrade}th`;
  if (!endGrade) return `${start} – Present`;
  if (endGrade === startGrade) return `${start} grade`;
  const end = GRADE_ORDINAL[endGrade] ?? `${endGrade}th`;
  return `${start} – ${end} grade`;
}

/** What to show in place of hours for an activity that isn't hour-tracked:
 * the student's own time-commitment text, else a grade range, else a
 * generic fallback. */
export function activityTimeLabel(activity: {
  time_commitment: string | null;
  start_grade: number | null;
  end_grade: number | null;
}): string {
  if (activity.time_commitment) return activity.time_commitment;
  if (activity.start_grade) {
    return gradeRangeLabel(activity.start_grade, activity.end_grade);
  }
  return "No hour tracking";
}
