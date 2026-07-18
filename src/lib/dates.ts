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
  isSummer = false,
  startedBeforeHs = false,
): string {
  const start = GRADE_ORDINAL[startGrade] ?? `${startGrade}th`;
  if (isSummer) return `Summer after ${start} grade`;
  if (startedBeforeHs) {
    if (!endGrade) return "Before high school – Present";
    const end = GRADE_ORDINAL[endGrade] ?? `${endGrade}th`;
    return `Before high school – ${end} grade`;
  }
  if (!endGrade) return `${start} – Present`;
  if (endGrade === startGrade) return `${start} grade`;
  const end = GRADE_ORDINAL[endGrade] ?? `${endGrade}th`;
  return `${start} – ${end} grade`;
}

/** What to show in place of hours for an activity that isn't hour-tracked:
 * the student's own time-commitment text, else a generic fallback. */
export function activityTimeLabel(activity: {
  time_commitment: string | null;
}): string {
  return activity.time_commitment || "Not tracked by hours";
}

/** Grades (9-12) an activity spans, inclusive. A null end grade means
 * "still doing this," which is treated as ongoing through 12th. */
export function gradesForActivity(activity: {
  start_grade: number | null;
  end_grade: number | null;
}): number[] {
  if (!activity.start_grade) return [];
  const end = activity.end_grade ?? 12;
  const grades: number[] = [];
  for (let g = activity.start_grade; g <= end; g++) grades.push(g);
  return grades;
}
