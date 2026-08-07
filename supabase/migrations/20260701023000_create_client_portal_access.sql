create table if not exists public.client_portal_access (
  event_id uuid primary key references public.events(id) on delete cascade,
  portal_enabled boolean not null default false,
  quotes_visible boolean not null default false,
  questionnaires_visible boolean not null default false,
  contracts_visible boolean not null default false,
  invoices_visible boolean not null default false,
  reviews_visible boolean not null default false,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_client_portal_access(target_event_id uuid)
returns public.client_portal_access
language plpgsql
set search_path = ''
as $$
declare
  accepted_quote_exists boolean;
  sent_quote_exists boolean;
  submitted_questionnaire_exists boolean;
  signed_contract_exists boolean;
  client_invoice_exists boolean;
  review_is_available boolean;
  synced public.client_portal_access;
begin
  select exists (
    select 1 from public.quotes
    where event_id = target_event_id
      and status in ('sent', 'viewed', 'accepted')
  ) into sent_quote_exists;

  select exists (
    select 1 from public.quotes
    where event_id = target_event_id and status = 'accepted'
  ) into accepted_quote_exists;

  select exists (
    select 1 from public.questionnaires
    where event_id = target_event_id and status = 'submitted'
  ) into submitted_questionnaire_exists;

  select exists (
    select 1 from public.contracts
    where event_id = target_event_id and status = 'signed'
  ) into signed_contract_exists;

  select exists (
    select 1 from public.invoices
    where event_id = target_event_id and client_visible
      and status in ('issued', 'payment_promised', 'paid')
  ) into client_invoice_exists;

  select exists (
    select 1 from public.events
    where id = target_event_id
      and booking_status = 'confirmed'
      and event_date < current_date
  ) into review_is_available;

  insert into public.client_portal_access (
    event_id, portal_enabled, quotes_visible, questionnaires_visible,
    contracts_visible, invoices_visible, reviews_visible, synced_at
  )
  values (
    target_event_id, sent_quote_exists, sent_quote_exists,
    accepted_quote_exists, submitted_questionnaire_exists,
    signed_contract_exists and client_invoice_exists,
    review_is_available, now()
  )
  on conflict (event_id) do update set
    portal_enabled = excluded.portal_enabled,
    quotes_visible = excluded.quotes_visible,
    questionnaires_visible = excluded.questionnaires_visible,
    contracts_visible = excluded.contracts_visible,
    invoices_visible = excluded.invoices_visible,
    reviews_visible = excluded.reviews_visible,
    synced_at = now()
  returning * into synced;

  return synced;
end;
$$;

drop trigger if exists set_client_portal_access_updated_at on public.client_portal_access;
create trigger set_client_portal_access_updated_at
before update on public.client_portal_access
for each row execute function public.set_updated_at();

alter table public.client_portal_access enable row level security;

grant select, insert, update, delete
on public.client_portal_access to authenticated, service_role;

grant execute on function public.sync_client_portal_access(uuid)
to authenticated, service_role;

drop policy if exists "CRM users manage client portal access"
on public.client_portal_access;

create policy "CRM users manage client portal access"
on public.client_portal_access for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
