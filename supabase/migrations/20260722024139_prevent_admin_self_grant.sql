-- The "own profile update"/"own profile insert" RLS policies only check row
-- ownership (auth.uid() = id), not which columns change. That means any
-- authenticated user could set is_admin = true on their own profile row via
-- a direct API call (bypassing the app entirely) and grant themselves admin.
-- This trigger blocks that: is_admin can only be set to true by a caller who
-- is already an admin, or by a non-authenticated-role connection (service
-- role / SQL editor), so the project owner can still bootstrap/manage admins
-- directly. Demoting (setting is_admin = false) is never blocked.
create or replace function public.prevent_admin_self_grant() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  admin_flag_changed boolean;
begin
  -- OLD isn't a valid record on INSERT, so branch on tg_op explicitly rather
  -- than relying on OR short-circuiting (not guaranteed by Postgres) to skip
  -- referencing it.
  if tg_op = 'INSERT' then
    admin_flag_changed := new.is_admin;
  else
    admin_flag_changed := new.is_admin and new.is_admin is distinct from old.is_admin;
  end if;

  if admin_flag_changed
    and auth.role() = 'authenticated'
    and not coalesce((select is_admin from public.profiles where id = auth.uid()), false)
  then
    raise exception 'Only existing admins can grant is_admin';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_admin_self_grant on public.profiles;
create trigger trg_prevent_admin_self_grant
  before insert or update on public.profiles
  for each row
  execute function public.prevent_admin_self_grant();
