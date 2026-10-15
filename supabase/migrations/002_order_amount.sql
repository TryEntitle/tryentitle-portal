-- Run this in Supabase -> SQL Editor to enable the Revenue stat on /admin.
-- Safe to run even if orders already exist; defaults existing rows to 0.
alter table public.orders add column if not exists amount numeric not null default 0;
