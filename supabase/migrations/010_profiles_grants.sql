-- Ensure the authenticated role can read/update its own profiles row.
-- Without table grants, PostgREST returns "permission denied for table profiles"
-- (distinct from an RLS policy miss), which must never reach the UI.

grant select, update on table public.profiles to authenticated;
grant select, update on table public.profiles to service_role;

-- Re-assert self-update RLS (idempotent) so Save/Skip on business info works
-- once grants are in place.
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
