-- Run this in Supabase -> SQL Editor.

-- 1. Profiles with roles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'customer' check (role in ('admin','customer')),
  company text
);
alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- 2. Auto-create a profile for every new user
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Admin helper used by RLS policies
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 4. Admins can read all profiles (so /admin can list customers)
create policy "admin reads all profiles" on public.profiles
  for select using (public.is_admin());

-- 5. Example customer data table. Copy this pattern for every customer-facing table.
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_id uuid not null references auth.users on delete cascade,
  title text,
  status text default 'new',
  created_at timestamptz default now()
);
alter table public.orders enable row level security;

create policy "customers see own, admin sees all" on public.orders
  for select using (customer_id = auth.uid() or public.is_admin());

-- 6. After you create your own account, make yourself admin
-- (replace the email, then run this one line):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
