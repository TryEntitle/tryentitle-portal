-- Run this in Supabase -> SQL Editor. Forward-looking: nothing writes to
-- this table yet (the app has no bank-transfer integration), but the shape
-- is here for whenever one is wired up — a real payout run would insert a
-- row here, and /admin/payouts already reads from it.
create table if not exists public.payouts (
  id bigint generated always as identity primary key,
  amount numeric not null default 0,
  status text not null default 'paid' check (status in ('paid', 'in transit')),
  account_label text,
  created_at timestamptz default now()
);
alter table public.payouts enable row level security;

create policy "admin manages payouts" on public.payouts
  for all using (public.is_admin()) with check (public.is_admin());
