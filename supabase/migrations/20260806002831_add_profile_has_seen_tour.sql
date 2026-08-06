-- Tracks whether a user has completed/dismissed the first-run dashboard
-- walkthrough, so it only ever shows once per account.
alter table public.profiles
  add column if not exists has_seen_tour boolean not null default false;
