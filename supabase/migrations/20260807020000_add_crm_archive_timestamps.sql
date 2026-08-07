alter table public.leads
  add column if not exists archived_at timestamptz;

alter table public.clients
  add column if not exists archived_at timestamptz;

create index if not exists leads_active_idx
  on public.leads(created_at desc)
  where archived_at is null;

create index if not exists clients_active_idx
  on public.clients(created_at desc)
  where archived_at is null;