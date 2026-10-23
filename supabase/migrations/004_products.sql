-- Run this in Supabase -> SQL Editor to enable the admin Products screens.
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  sku text,
  price numeric not null default 0,
  status text not null default 'draft' check (status in ('live', 'draft')),
  description text,
  created_at timestamptz default now()
);
alter table public.products enable row level security;

-- Products are the merchant's own catalog, not customer-facing data, so
-- only admins get access (unlike orders, which customers also read their
-- own rows of).
create policy "admin manages products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
