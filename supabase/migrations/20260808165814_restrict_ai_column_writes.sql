-- P0 fix: RLS on activities/profiles checks row ownership only, not which
-- columns are being changed. Combined with the original blanket
-- "GRANT ... UPDATE ON <table> TO authenticated" (no column list), any
-- signed-in student could call the Supabase REST API directly (using the
-- same NEXT_PUBLIC_SUPABASE_URL/ANON_KEY every page already ships, plus
-- their own session) and PATCH their own activities/profiles row to set
-- ai_relevance_score, ai_summary, ai_relevance, ai_suggestions, etc. to
-- anything they want -- completely bypassing analyzeActivity()'s actual
-- Gemini call. Same gap on profiles.email, which the admin dashboard trusts
-- as an identity mirror, and profiles.ai_recommendations. This is the same
-- class of bug prevent_admin_self_grant already closed for is_admin; it was
-- just never generalized to the AI-written / admin-trusted columns.
--
-- Fix: revoke the blanket grants and re-grant column-scoped INSERT/UPDATE to
-- authenticated covering only the fields a student legitimately edits
-- themselves. The AI-written columns become writable only by service_role
-- (already GRANT ALL) -- analyzeActivity()/getRecommendations() are updated
-- separately to use a service-role client for just that write, after
-- already verifying ownership with the caller's own session.
--
-- ai_analyzed_at is the one AI-written column left in the authenticated
-- grant: updateActivity() legitimately clears it to null on every edit (to
-- re-trigger analysis), so a student's own edit action needs to keep working.
-- A student being able to set it to an arbitrary timestamp on their own row
-- isn't a privilege escalation -- worst case is their own AI feedback
-- section rendering empty/stale, same as if analysis just hadn't run yet.

revoke insert, update on public.activities from authenticated;
grant insert (
  user_id, name, category, organization, description, leadership_role,
  skills, start_date, end_date, start_grade, end_grade, is_summer,
  started_before_hs, tracks_hours, time_commitment
) on public.activities to authenticated;
grant update (
  name, category, organization, description, leadership_role, skills,
  start_date, end_date, start_grade, end_grade, is_summer,
  started_before_hs, tracks_hours, time_commitment, ai_analyzed_at
) on public.activities to authenticated;

revoke update on public.profiles from authenticated;
grant update (
  display_name, grade_level, intended_majors, exploring, onboarded,
  has_seen_tour
) on public.profiles to authenticated;
