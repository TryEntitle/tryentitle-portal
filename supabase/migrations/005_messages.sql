-- Run this in Supabase -> SQL Editor to enable the Messages screens.
-- One thread per customer: customer_id identifies the thread, sender_id
-- is whoever wrote that particular message (the customer or an admin).
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  customer_id uuid not null references auth.users on delete cascade,
  sender_id uuid not null references auth.users on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;

create policy "read own thread or admin" on public.messages
  for select using (customer_id = auth.uid() or public.is_admin());

create policy "post into own thread or admin" on public.messages
  for insert with check (
    sender_id = auth.uid() and (customer_id = auth.uid() or public.is_admin())
  );

-- Enables Supabase Realtime (live message delivery) for this table.
alter publication supabase_realtime add table public.messages;
