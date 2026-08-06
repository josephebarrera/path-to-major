-- Lets the AI decline to score an activity when the description is too thin
-- to assess honestly (e.g. "write music" for an activity called "Artist"),
-- instead of fabricating a confident-looking score and feedback from almost
-- no information. When true, ai_relevance_score/ai_skills/ai_relevance/
-- ai_suggestions/ai_related are left null/empty and ai_summary carries a
-- request for the specific detail that would let it be scored.
alter table public.activities add column if not exists ai_needs_more_detail boolean not null default false;
