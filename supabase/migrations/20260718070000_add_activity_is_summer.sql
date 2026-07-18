-- Distinguishes a summer program (e.g. "summer after 10th grade") from a
-- genuine multi-year grade range, so the UI can render "Summer after Xth
-- grade" instead of a raw "X - Y grade" span that reads like two full years.
alter table public.activities add column if not exists is_summer boolean not null default false;
