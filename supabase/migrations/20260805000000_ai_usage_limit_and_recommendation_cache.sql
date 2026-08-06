-- Guards against unbounded Gemini token spend: a per-user daily request
-- counter (atomic increment via a security-definer function so the client
-- can never write another user's row or fake a lower count) plus a cache
-- for recommendations so an uncached page load/refresh doesn't call the
-- LLM every time.

create table public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  request_count int not null default 0,
  primary key (user_id, usage_date)
);
grant select on public.ai_usage_daily to authenticated;
grant all on public.ai_usage_daily to service_role;
alter table public.ai_usage_daily enable row level security;
create policy "own ai usage select" on public.ai_usage_daily for select to authenticated using (auth.uid() = user_id);

-- Writes only happen through this function (no insert/update policy for
-- authenticated) so a request always increments exactly one row for the
-- caller's own id, atomically, regardless of concurrent calls.
create or replace function public.increment_ai_usage() returns int language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  insert into public.ai_usage_daily (user_id, usage_date, request_count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, usage_date)
  do update set request_count = ai_usage_daily.request_count + 1
  returning request_count into v_count;
  return v_count;
end;
$$;
revoke execute on function public.increment_ai_usage() from public, anon;
grant execute on function public.increment_ai_usage() to authenticated;

alter table public.profiles add column if not exists ai_recommendations jsonb;
alter table public.profiles add column if not exists ai_recommendations_at timestamptz;
