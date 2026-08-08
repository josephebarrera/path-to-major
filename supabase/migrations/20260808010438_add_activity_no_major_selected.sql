-- Mirrors ai_needs_more_detail: lets analyzeActivity() decline to score an
-- activity when the student has no intended major selected (still
-- exploring, or hasn't onboarded yet) instead of scoring against the
-- meaningless placeholder "an undecided major". When true,
-- ai_relevance_score/ai_skills/ai_relevance/ai_suggestions/ai_related are
-- left null/empty, no AI call is made, and ai_summary carries a prompt to
-- set an intended major.
alter table public.activities add column if not exists ai_no_major_selected boolean not null default false;
