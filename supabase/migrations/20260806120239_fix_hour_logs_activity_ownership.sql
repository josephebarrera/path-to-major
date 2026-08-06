-- The original "own hour logs all" policy only checked that user_id matched
-- the caller — it never verified that activity_id actually referenced an
-- activity owned by that same caller. That let any authenticated user insert
-- (or update) an hour_logs row pointing at someone else's activity_id, as
-- long as they stamped their own id as user_id. Splitting into granular
-- per-operation policies (per project convention) and adding the missing
-- ownership check on insert/update closes that gap.
drop policy if exists "own hour logs all" on public.hour_logs;

create policy "own hour logs select" on public.hour_logs
  for select to authenticated
  using (auth.uid() = user_id);

create policy "own hour logs insert" on public.hour_logs
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.activities a
      where a.id = activity_id and a.user_id = auth.uid()
    )
  );

create policy "own hour logs update" on public.hour_logs
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.activities a
      where a.id = activity_id and a.user_id = auth.uid()
    )
  );

create policy "own hour logs delete" on public.hour_logs
  for delete to authenticated
  using (auth.uid() = user_id);
