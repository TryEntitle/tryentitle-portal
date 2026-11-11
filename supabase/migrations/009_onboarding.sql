-- Onboarding wizard completion. New signups leave this null and are sent
-- through /onboarding once; existing accounts are marked complete so they
-- are not forced through the new flow after deploy.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

update public.profiles
set onboarding_completed_at = coalesce(created_at, now())
where onboarding_completed_at is null;
