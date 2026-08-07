create table if not exists public.event_sat_facturas (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  quote_version_id uuid references public.quote_versions(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  payment_partner_venue_id uuid references public.venues(id) on delete set null,
  recipient_client_id uuid references public.clients(id) on delete set null,
  fiscal_profile_id uuid references public.sat_fiscal_profiles(id) on delete set null,
  bank_account_id uuid references public.sat_bank_accounts(id) on delete set null,
  creation_source text not null default 'manual' check (
    creation_source in ('manual', 'auto_pv_confirmation')
  ),
  recipient_type text not null default 'venue_hotel' check (
    recipient_type in ('venue_hotel', 'client', 'other')
  ),
  status text not null default 'pending' check (
    status in (
      'pending', 'accountant_requested', 'issued', 'sent_to_venue',
      'partially_paid', 'paid', 'cancelled'
    )
  ),
  factura_number text not null default '',
  uuid_fiscal text not null default '',
  recipient_name text not null default '',
  rfc text not null default '',
  tax_regime text not null default '',
  cfdi_use text not null default '',
  payment_method text not null default '',
  payment_form text not null default '',
  currency text not null default 'mxn' check (currency in ('mxn', 'usd')),
  exchange_rate_to_mxn numeric(12,6) not null default 1 check (exchange_rate_to_mxn > 0),
  source_total_mxn numeric(12,2) not null default 0 check (source_total_mxn >= 0),
  commission_mxn numeric(12,2) not null default 0 check (commission_mxn >= 0),
  subtotal_mxn numeric(12,2) not null default 0 check (subtotal_mxn >= 0),
  iva_mxn numeric(12,2) not null default 0 check (iva_mxn >= 0),
  iva_retention_mxn numeric(12,2) not null default 0 check (iva_retention_mxn >= 0),
  isr_retention_mxn numeric(12,2) not null default 0 check (isr_retention_mxn >= 0),
  tax_total_mxn numeric(12,2) not null default 0 check (tax_total_mxn >= 0),
  total_mxn numeric(12,2) not null default 0 check (total_mxn >= 0),
  due_at date,
  accountant_requested_at timestamptz,
  issued_at timestamptz,
  sent_to_venue_at timestamptz,
  paid_at timestamptz,
  requires_complemento boolean not null default false,
  complemento_status text not null default 'not_required' check (
    complemento_status in ('not_required', 'pending', 'requested', 'received', 'sent')
  ),
  complemento_requested_at timestamptz,
  complemento_received_at timestamptz,
  complemento_sent_at timestamptz,
  factura_pdf_url text not null default '',
  factura_xml_url text not null default '',
  complemento_pdf_url text not null default '',
  complemento_xml_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sat_payments (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete set null,
  bank_account_id uuid references public.sat_bank_accounts(id) on delete set null,
  payment_date date not null,
  amount_mxn numeric(12,2) not null check (amount_mxn > 0),
  reference text not null default '',
  proof_file_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sat_payment_facturas (
  payment_id uuid not null references public.sat_payments(id) on delete cascade,
  factura_id uuid not null references public.event_sat_facturas(id) on delete cascade,
  amount_applied_mxn numeric(12,2) not null check (amount_applied_mxn > 0),
  created_at timestamptz not null default now(),
  primary key (payment_id, factura_id)
);

create index if not exists event_sat_facturas_event_idx on public.event_sat_facturas(event_id);
create index if not exists event_sat_facturas_status_idx on public.event_sat_facturas(status);
create unique index if not exists event_sat_facturas_one_auto_pv_idx
on public.event_sat_facturas(event_id)
where creation_source = 'auto_pv_confirmation';
create index if not exists sat_payments_venue_idx on public.sat_payments(venue_id);
create index if not exists sat_payment_facturas_factura_idx on public.sat_payment_facturas(factura_id);

create or replace function public.get_sat_due_date(event_date date, due_rule text, due_day integer)
returns date
language sql
immutable
set search_path = ''
as $$
  select case due_rule
    when 'same_day' then event_date
    when 'next_day' then event_date + 1
    when 'monthly_same_month' then make_date(
      extract(year from event_date)::int,
      extract(month from event_date)::int,
      least(coalesce(due_day, 1), 28)
    )
    when 'monthly_cutoff' then
      case
        when extract(day from event_date)::int <= coalesce(due_day, 1) then
          make_date(extract(year from event_date)::int, extract(month from event_date)::int, least(coalesce(due_day, 1), 28))
        else
          (make_date(extract(year from event_date)::int, extract(month from event_date)::int, 1)
            + interval '1 month'
            + (least(coalesce(due_day, 1), 28) - 1) * interval '1 day')::date
      end
    else null
  end;
$$;

create or replace function public.ensure_event_sat_factura(target_event_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  selected_event public.events%rowtype;
  selected_venue public.venues%rowtype;
  selected_factura_id uuid;
begin
  select * into selected_event from public.events where id = target_event_id;
  if not found then raise exception 'event_not_found'; end if;

  if selected_event.booking_status <> 'confirmed'
    or selected_event.booking_type <> 'preferred_vendor' then
    return null;
  end if;

  select * into selected_venue
  from public.venues
  where id = coalesce(selected_event.payment_partner_venue_id, selected_event.venue_id);

  select id into selected_factura_id
  from public.event_sat_facturas
  where event_id = selected_event.id
    and creation_source = 'auto_pv_confirmation'
  limit 1;

  if selected_factura_id is not null then
    update public.event_sat_facturas
    set venue_id = selected_event.venue_id,
        payment_partner_venue_id = selected_event.payment_partner_venue_id,
        updated_at = now()
    where id = selected_factura_id;

    return selected_factura_id;
  end if;

  insert into public.event_sat_facturas (
    event_id, venue_id, payment_partner_venue_id, creation_source,
    recipient_type, fiscal_profile_id, bank_account_id, recipient_name,
    rfc, tax_regime, cfdi_use, payment_method, payment_form, due_at
  )
  values (
    selected_event.id, selected_event.venue_id, selected_event.payment_partner_venue_id,
    'auto_pv_confirmation', 'venue_hotel',
    selected_venue.fiscal_default_profile_id, selected_venue.fiscal_default_bank_account_id,
    coalesce(nullif(selected_venue.fiscal_legal_name, ''), selected_venue.name, selected_event.venue_name, ''),
    selected_venue.fiscal_rfc, selected_venue.fiscal_tax_regime,
    selected_venue.fiscal_cfdi_use, selected_venue.fiscal_payment_method,
    selected_venue.fiscal_payment_form,
    public.get_sat_due_date(selected_event.event_date, selected_venue.fiscal_due_rule, selected_venue.fiscal_due_day)
  )
  returning id into selected_factura_id;

  return selected_factura_id;
end;
$$;

create or replace function public.ensure_confirmed_pv_sat_factura()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.booking_status = 'confirmed'
    and new.booking_type = 'preferred_vendor' then
    if tg_op = 'INSERT' then
      perform public.ensure_event_sat_factura(new.id);
    elsif old.booking_status is distinct from new.booking_status
      or old.booking_type is distinct from new.booking_type then
      perform public.ensure_event_sat_factura(new.id);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_confirmed_pv_sat_factura on public.events;
create trigger ensure_confirmed_pv_sat_factura
after insert or update of booking_status, booking_type on public.events
for each row execute function public.ensure_confirmed_pv_sat_factura();

drop trigger if exists set_event_sat_facturas_updated_at on public.event_sat_facturas;
create trigger set_event_sat_facturas_updated_at
before update on public.event_sat_facturas
for each row execute function public.set_updated_at();

drop trigger if exists set_sat_payments_updated_at on public.sat_payments;
create trigger set_sat_payments_updated_at
before update on public.sat_payments
for each row execute function public.set_updated_at();

alter table public.event_sat_facturas enable row level security;
alter table public.sat_payments enable row level security;
alter table public.sat_payment_facturas enable row level security;

grant select, insert, update, delete
on public.event_sat_facturas, public.sat_payments, public.sat_payment_facturas
to authenticated, service_role;

grant execute on function public.ensure_event_sat_factura(uuid)
to authenticated, service_role;

drop policy if exists "CRM users manage SAT facturas" on public.event_sat_facturas;
create policy "CRM users manage SAT facturas"
on public.event_sat_facturas for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage SAT payments" on public.sat_payments;
create policy "CRM users manage SAT payments"
on public.sat_payments for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage SAT payment facturas" on public.sat_payment_facturas;
create policy "CRM users manage SAT payment facturas"
on public.sat_payment_facturas for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
