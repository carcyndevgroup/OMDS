create table if not exists public.contract_audit_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  event_type text not null check (event_type in (
    'contract_created',
    'contract_sent',
    'contract_viewed',
    'terms_accepted',
    'contract_signed',
    'contract_downloaded',
    'contract_voided',
    'contract_countersigned'
  )),
  occurred_at timestamptz not null default now(),
  actor_type text not null default 'system',
  authentication_method text,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists contract_audit_events_contract_idx
on public.contract_audit_events(contract_id, occurred_at);

alter table public.contract_audit_events enable row level security;

grant select on public.contract_audit_events to authenticated, service_role;
grant insert on public.contract_audit_events to service_role;

create policy "CRM users view contract audit events"
on public.contract_audit_events for select to authenticated
using ((select private.is_crm_user()));
