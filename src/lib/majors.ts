export const MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Cybersecurity",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biomedical Engineering",
  "Nursing",
  "Pre-Med / Biology",
  "Public Health",
  "Neuroscience",
  "Psychology",
  "Business Administration",
  "Finance",
  "Accounting",
  "Marketing",
  "Economics",
  "International Relations",
  "Political Science",
  "Law / Pre-Law",
  "Communications",
  "Journalism",
  "English / Creative Writing",
  "History",
  "Philosophy",
  "Sociology",
  "Anthropology",
  "Education",
  "Elementary Education",
  "Secondary Education",
  "Environmental Science",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Statistics",
  "Architecture",
  "Graphic Design",
  "Industrial Design",
  "Film & Media",
  "Music",
  "Theater / Performing Arts",
  "Fine Arts",
  "Kinesiology / Sports Science",
  "Culinary Arts",
  "Hospitality Management",
  "Supply Chain Management",
  "Entrepreneurship",
  "Undecided / Exploring",
] as const;

export const ACTIVITY_CATEGORIES = [
  "Club",
  "Sport",
  "Robotics",
  "Volunteer",
  "Internship",
  "Job",
  "Competition",
  "Leadership",
  "Research",
  "Personal Project",
  "Arts",
  "Music",
  "Other",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

/* Category colors are grouped into 5 semantic families (plus neutral) so the
   color actually communicates the *kind* of activity instead of reading as a
   13-hue rainbow: STEM=blue, service=rose, business/leadership=amber,
   arts=violet, athletics=emerald. */
const STEM_STYLE = {
  badge: "bg-blue-500/15 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  glow: "oklch(0.6 0.18 250)",
};
const SERVICE_STYLE = {
  badge: "bg-rose-500/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  glow: "oklch(0.62 0.2 15)",
};
const BUSINESS_STYLE = {
  badge:
    "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  glow: "oklch(0.75 0.15 80)",
};
const ARTS_STYLE = {
  badge:
    "bg-violet-500/15 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  glow: "oklch(0.62 0.2 300)",
};
const ATHLETICS_STYLE = {
  badge:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  glow: "oklch(0.65 0.18 155)",
};
const NEUTRAL_STYLE = {
  badge:
    "bg-slate-500/15 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  glow: "oklch(0.6 0.02 260)",
};

export const CATEGORY_STYLES: Record<string, { badge: string; glow: string }> =
  {
    Robotics: STEM_STYLE,
    Research: STEM_STYLE,
    "Personal Project": STEM_STYLE,
    Volunteer: SERVICE_STYLE,
    Internship: BUSINESS_STYLE,
    Job: BUSINESS_STYLE,
    Leadership: BUSINESS_STYLE,
    Competition: BUSINESS_STYLE,
    Club: ARTS_STYLE,
    Arts: ARTS_STYLE,
    Music: ARTS_STYLE,
    Sport: ATHLETICS_STYLE,
    Other: NEUTRAL_STYLE,
  };

export function categoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other;
}

export function formatMajors(majors: string[]): string {
  if (majors.length === 0) return "";
  if (majors.length === 1) return majors[0];
  return `${majors.slice(0, -1).join(", ")} & ${majors[majors.length - 1]}`;
}
