create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  template_key text not null default 'service_contract',
  title text not null default 'Service Contract',
  locale text not null default 'en' check (locale in ('en', 'es')),
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'signed', 'void')
  ),
  contract_data jsonb not null default '{}'::jsonb,
  legal_signature_name text not null default '',
  internal_notes text not null default '',
  sent_at timestamptz,
  signed_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, template_key)
);

create index if not exists contracts_event_idx
on public.contracts(event_id);

drop trigger if exists set_contracts_updated_at on public.contracts;

create trigger set_contracts_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

alter table public.contracts enable row level security;

grant select, insert, update, delete
on public.contracts to authenticated, service_role;

drop policy if exists "CRM users manage contracts" on public.contracts;

create policy "CRM users manage contracts"
on public.contracts for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
