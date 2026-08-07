alter table public.event_sat_facturas
add column if not exists tax_object text not null default '02',
add column if not exists service_description text not null default '',
add column if not exists pax integer check (pax is null or pax > 0),
add column if not exists unit_value_mxn numeric(12,2) not null default 0 check (unit_value_mxn >= 0),
add column if not exists exchange_rate_source text not null default '',
add column if not exists accountant_request_text text not null default '';

update public.event_sat_facturas as factura
set tax_object = venue.fiscal_tax_object
from public.venues as venue
where venue.id = coalesce(factura.payment_partner_venue_id, factura.venue_id)
  and factura.tax_object = '02';

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
        tax_object = selected_venue.fiscal_tax_object,
        updated_at = now()
    where id = selected_factura_id;

    return selected_factura_id;
  end if;

  insert into public.event_sat_facturas (
    event_id, venue_id, payment_partner_venue_id, creation_source,
    recipient_type, fiscal_profile_id, bank_account_id, recipient_name,
    rfc, tax_regime, cfdi_use, payment_method, payment_form, tax_object,
    due_at, pax
  )
  values (
    selected_event.id, selected_event.venue_id, selected_event.payment_partner_venue_id,
    'auto_pv_confirmation', 'venue_hotel',
    selected_venue.fiscal_default_profile_id, selected_venue.fiscal_default_bank_account_id,
    coalesce(nullif(selected_venue.fiscal_legal_name, ''), selected_venue.name, selected_event.venue_name, ''),
    selected_venue.fiscal_rfc, selected_venue.fiscal_tax_regime,
    selected_venue.fiscal_cfdi_use, selected_venue.fiscal_payment_method,
    selected_venue.fiscal_payment_form, selected_venue.fiscal_tax_object,
    public.get_sat_due_date(selected_event.event_date, selected_venue.fiscal_due_rule, selected_venue.fiscal_due_day),
    selected_event.guest_count
  )
  returning id into selected_factura_id;

  return selected_factura_id;
end;
$$;

grant execute on function public.ensure_event_sat_factura(uuid)
to authenticated, service_role;
