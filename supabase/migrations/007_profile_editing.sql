-- Run this in Supabase -> SQL Editor to enable the Settings -> Profile tab
-- and notification toggles.

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;

-- Profiles had no self-update policy before now (only self/admin SELECT).
-- Letting people edit their own company/full_name/phone needs one, but a
-- blanket "update your own row" policy would also let a customer set
-- their own `role` to 'admin' via a direct client call, bypassing the UI
-- entirely. This trigger closes that regardless of which columns a client
-- sends: role only changes when an existing admin performs the update, or
-- when the request is made with the service_role key (RLS-bypassing, but
-- triggers still run — auth.role() lets this specific one recognize and
-- allow it, used by app/api/admin/invite-teammate to grant the new
-- teammate's admin role after inviteUserByEmail creates their account).
create or replace function public.prevent_role_self_escalation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.role() <> 'service_role' then
    new.role = old.role;
  end if;
  return new;
end $$;

drop trigger if exists before_profile_update on public.profiles;
create trigger before_profile_update before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Admins also need to update OTHER rows (e.g. removing a teammate sets
-- their role back to 'customer') — the policy above only covers your own
-- row. The trigger above still has the final say on `role` either way.
create policy "admin updates any profile" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Per-user notification preferences (Settings -> Notifications).
create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users on delete cascade,
  order_updates boolean not null default true,
  new_messages boolean not null default true,
  weekly_summary boolean not null default false
);
alter table public.notification_prefs enable row level security;

create policy "manage own notification prefs" on public.notification_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
