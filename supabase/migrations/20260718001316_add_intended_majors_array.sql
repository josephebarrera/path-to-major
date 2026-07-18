-- Allow students to select up to 3 intended majors instead of exactly one.
-- App-layer enforces the max-3 cap; the array itself is unbounded here.
alter table public.profiles add column if not exists intended_majors text[] not null default '{}';

update public.profiles
set intended_majors = array[intended_major]
where intended_major is not null and intended_majors = '{}';

alter table public.profiles drop column if exists intended_major;
