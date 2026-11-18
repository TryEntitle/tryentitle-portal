-- Team-only record that the portal reported incomplete server configuration.
-- Written by public.record_config_outage(), which is executable by
-- service_role only. RLS is on and there are no policies, and anon /
-- authenticated have no grants, so the data API cannot read or write this
-- table. Read it in the Supabase SQL editor (postgres role).
--
-- The function dedupes for 30 minutes and stores a fixed kind only — no
-- free-text column a caller could use to store a secret.

create table if not exists public.ops_incidents (
  id bigint generated always as identity primary key,
  kind text not null check (kind = 'configuration_incomplete'),
  created_at timestamptz not null default now()
);

alter table public.ops_incidents enable row level security;

revoke all on table public.ops_incidents from public, anon, authenticated, service_role;

create index if not exists ops_incidents_kind_created_at_idx
  on public.ops_incidents (kind, created_at desc);

create or replace function public.record_config_outage()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.ops_incidents
    where kind = 'configuration_incomplete'
      and created_at > now() - interval '30 minutes'
  ) then
    return;
  end if;
  insert into public.ops_incidents (kind) values ('configuration_incomplete');
end;
$$;

revoke all on function public.record_config_outage() from public, anon, authenticated;
grant execute on function public.record_config_outage() to service_role;
