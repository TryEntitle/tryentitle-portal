-- Run this in Supabase -> SQL Editor to enable email + "joined" date on the
-- admin Customers screens. Safe to run on an existing project: backfills
-- from auth.users for rows that already exist, then keeps new signups in
-- sync via the handle_new_user trigger.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

update public.profiles p
set email = u.email, created_at = u.created_at
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, created_at) values (new.id, new.email, new.created_at);
  return new;
end $$;
