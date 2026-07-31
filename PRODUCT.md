# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are high school students planning for college. They're figuring out which of their existing and future activities — clubs, jobs, sports, music, leadership roles, volunteering — actually support the specific major(s) they intend to study, and what to add next to strengthen that case.

The admin dashboard is not a second user-facing role. It exists solely for the operator (the founder) to monitor platform health during early development — user counts, activity volume, AI-feedback coverage — not as a feature students, counselors, or parents are meant to use.

## Product Purpose

PathToMajor helps a student look at their list of extracurricular activities and know whether it's building a coherent, major-aligned case for college admissions — rather than guessing. A student logs an activity, PathToMajor scores how well it supports their intended major and explains why, and tells them what to add next. Success is a student who can articulate, activity by activity, how their extracurriculars connect to what they want to study.

## Positioning

Generic activity/hour trackers log what a student did. PathToMajor is specific to the student's *intended major*: every logged activity gets an AI relevance score (0–100) plus skill tags and written feedback scoped to that major, and the product tells the student what's missing rather than just totaling hours. A neighboring generic tracker could not truthfully claim the same major-specific relevance scoring.

## Operating Context

- **Onboarding**: student signs up, selects intended major(s).
- **Logging activities**: student records an activity under a category (Club, Job, Sport, Music, Leadership, Volunteer), with grade level and optional summer-program timing.
- **AI analysis**: each activity is scored for relevance to the student's intended major (0–100), with written feedback and skill tags. Requires an AI provider API key to run; without one configured, analysis does not occur (the dashboard must reflect this honestly rather than showing inflated feedback counts).
- **Hour tracking**: students log hours per session against an activity; the dashboard shows total hours with a per-activity breakdown.
- **Recommendations**: a dedicated view suggests what to add next based on the student's intended major and current activity list.
- **Admin**: operator-only aggregate view (total users, onboarded count, total activities, total hours, AI-feedback coverage) — not part of the student-facing product.

## Capabilities and Constraints

- Auth and data via Supabase; all activity/hour-log reads and writes are scoped per-user (RLS plus explicit `user_id` filters in application code).
- Self-service promotion to admin is blocked at the database level (a user cannot grant themselves `is_admin`).
- Activity categories are currently: Club, Job, Sport, Music, Leadership, Volunteer. ("Robotics" was removed as a category and folded into Club — it's a domain of club activity, not a distinct organizational type.)
- "Before 9th grade" is not a valid timing option for summer-program activities — summers before 9th grade aren't counted toward this product's tracking.
- AI relevance analysis is entirely dependent on a configured API key; this must never be silently faked or approximated in the UI when absent.
- Terminology: "intended major(s)," "activity," "hour log" / "session," "relevance score."

## Brand Commitments

- Product name: **PathToMajor**.
- The codebase carries four long-lived branches with different visual themes (see `.claude/rules/branches.md`); `new-taste` is the active branch, forked from `strict-template`, with an explicit goal of keeping all existing functionality unchanged while replacing the current generic/"AI-slop" visual identity with something more personalized. No visual system is locked in yet — that decision belongs to design work (`new-work`), not here.
- No other binding voice, logo, or asset commitments exist yet.

## Evidence on Hand

None. No real testimonials, school partnerships, pilot cohorts, or usage data exist yet. Future design and copy work must not invent or imply any of these.

## Product Principles

1. Relevance is always evaluated against the student's *actual* intended major — never generic or one-size-fits-all.
2. Feedback must be specific and actionable (what to add next), not just a numeric score.
3. Student data stays strictly scoped to that student; admin visibility is an operator convenience, not something the product should be designed around.
4. This is a solo, early-stage, pre-launch product. Multi-tenant roles (counselor accounts, parent accounts, school partnerships) are explicitly out of scope until real usage or a real request justifies them — don't design or build for them speculatively.
