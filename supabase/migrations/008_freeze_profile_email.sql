-- Freeze profiles.email against client writes.
-- Email is a mirror of auth.users.email (see 003_profile_email_joined.sql).
-- Clients must not be able to change it: the admin invite flow previously
-- looked up teammates by this column, so a customer who rewrote their own
-- email could steal an invite promotion. Role changes stay governed by
-- prevent_role_self_escalation; this trigger only protects email.
-- service_role may still update email for trusted sync jobs.

create or replace function public.prevent_email_spoof() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email and auth.role() <> 'service_role' then
    new.email = old.email;
  end if;
  return new;
end $$;

drop trigger if exists before_profile_email_update on public.profiles;
create trigger before_profile_email_update before update on public.profiles
  for each row execute function public.prevent_email_spoof();
