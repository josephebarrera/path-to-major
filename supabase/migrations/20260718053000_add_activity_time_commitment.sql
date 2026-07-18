-- Not every activity has a countable hour commitment (e.g. a fixed-length
-- summer program). Let students opt out of hour tracking per-activity and
-- describe the commitment in free text instead.
alter table public.activities add column if not exists tracks_hours boolean not null default true;
alter table public.activities add column if not exists time_commitment text;
