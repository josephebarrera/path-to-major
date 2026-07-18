-- Some activities (e.g. a sport played every year) don't have meaningful
-- calendar start/end dates, but do have a grade range: "started 9th grade,
-- played through 12th grade." Let students record that instead of dates.
alter table public.activities add column if not exists start_grade smallint;
alter table public.activities add column if not exists end_grade smallint;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'activities_start_grade_range'
  ) then
    alter table public.activities add constraint activities_start_grade_range
      check (start_grade is null or start_grade between 9 and 12);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'activities_end_grade_range'
  ) then
    alter table public.activities add constraint activities_end_grade_range
      check (end_grade is null or end_grade between 9 and 12);
  end if;
end $$;
