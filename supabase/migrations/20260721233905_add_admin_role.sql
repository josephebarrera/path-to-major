-- Adds an admin role for a read-only internal dashboard. Admins get SELECT
-- access to every user's rows (additive to the existing "own rows only"
-- policies, which are unchanged); no admin write/delete access is granted
-- here on purpose.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- auth.users isn't reachable through the client library or RLS, so mirror
-- email into profiles (kept in sync going forward via handle_new_user)
-- purely so an admin can identify who a row belongs to.
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end; $$;

-- Security-definer wrapper so RLS policies can check "is this caller an
-- admin" without recursively re-evaluating RLS on profiles while doing so.
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "admin read all profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "admin read all activities" on public.activities for select to authenticated using (public.is_admin());
create policy "admin read all hour logs" on public.hour_logs for select to authenticated using (public.is_admin());
