-- Brute-force protection for password sign-in. Tracks failed attempts per
-- email (not per user, since a wrong email shouldn't leak whether an
-- account exists) and locks that email out for a cooldown window after too
-- many failures in a row. Only reachable through the two security-definer
-- functions below (no direct table access for any role) so the counters
-- can't be read or tampered with by a client.

create table public.login_attempts (
  email text primary key,
  failed_count int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.login_attempts enable row level security;
-- No policies: this table is only ever touched by the security-definer
-- functions below, which run as the table owner and bypass RLS. Neither
-- anon nor authenticated gets any direct select/insert/update/delete.

grant all on public.login_attempts to service_role;

-- Called before attempting a sign-in. Returns the lockout expiry if this
-- email is currently locked out, otherwise null. Read-only: a check alone
-- never counts as an attempt.
create or replace function public.check_login_lock(p_email text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_locked_until timestamptz;
begin
  select locked_until into v_locked_until
  from public.login_attempts
  where email = lower(trim(p_email));

  if v_locked_until is not null and v_locked_until > now() then
    return v_locked_until;
  end if;

  return null;
end;
$$;
revoke execute on function public.check_login_lock(text) from public;
grant execute on function public.check_login_lock(text) to anon, authenticated;

-- Called after a sign-in attempt with its outcome. A success clears the
-- email's history. A failure increments the counter and, once it reaches
-- the threshold, sets a cooldown and resets the counter for the next
-- window.
create or replace function public.record_login_attempt(p_email text, p_success boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email));
  v_max_attempts constant int := 5;
  v_lockout_minutes constant int := 15;
  v_count int;
begin
  if p_success then
    delete from public.login_attempts where email = v_email;
    return;
  end if;

  insert into public.login_attempts (email, failed_count, updated_at)
  values (v_email, 1, now())
  on conflict (email) do update
    set failed_count = login_attempts.failed_count + 1,
        updated_at = now()
  returning failed_count into v_count;

  if v_count >= v_max_attempts then
    update public.login_attempts
    set locked_until = now() + make_interval(mins => v_lockout_minutes),
        failed_count = 0
    where email = v_email;
  end if;
end;
$$;
revoke execute on function public.record_login_attempt(text, boolean) from public;
grant execute on function public.record_login_attempt(text, boolean) to anon, authenticated;
