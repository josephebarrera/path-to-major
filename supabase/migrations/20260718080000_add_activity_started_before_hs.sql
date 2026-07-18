-- Tracks whether an activity began before 9th grade (e.g. a church or
-- community role started in middle school that carried into high school),
-- so the UI can say "Before high school" instead of misrepresenting an
-- earlier start as literally 9th grade.
alter table public.activities add column if not exists started_before_hs boolean not null default false;
