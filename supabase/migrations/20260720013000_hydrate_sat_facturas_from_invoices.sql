create or replace function public.ensure_event_sat_factura(target_event_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  selected_event public.events%rowtype;
  selected_venue public.venues%rowtype;
  selected_invoice public.invoices%rowtype;
  selected_factura public.event_sat_facturas%rowtype;
  selected_profile public.sat_fiscal_profiles%rowtype;
  selected_fiscal_profile_id uuid;
  selected_quote_version_id uuid;
  selected_source_mxn numeric := 0;
  selected_service text := '';
  selected_commission_mxn numeric := 0;
  selected_subtotal_mxn numeric := 0;
  selected_iva_mxn numeric := 0;
  selected_iva_retention_mxn numeric := 0;
  selected_isr_retention_mxn numeric := 0;
  selected_total_mxn numeric := 0;
  selected_unit_value_mxn numeric := 0;
  selected_accountant_request text := '';
  selected_client_name text := '';
  selected_recipient_name text := '';
  selected_recipient_rfc text := '';
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

  select concat_ws(' ', client.first_name, client.last_name)
  into selected_client_name
  from public.event_contacts as contact
  join public.clients as client on client.id = contact.client_id
  where contact.event_id = selected_event.id
  order by contact.is_primary desc, contact.client_id asc
  limit 1;

  select * into selected_invoice
  from public.invoices
  where event_id = selected_event.id
    and status <> 'void'
  order by case when invoice_type = 'pv_internal_factura' then 0 else 1 end,
    created_at desc
  limit 1;

  if found then
    selected_quote_version_id := selected_invoice.quote_version_id;
    selected_source_mxn := coalesce(selected_invoice.subtotal_mxn, 0);

    select coalesce(string_agg(description, ' + ' order by sort_order), '')
    into selected_service
    from public.invoice_items
    where invoice_id = selected_invoice.id;
  else
    select version.id, coalesce(version.subtotal_mxn, 0),
      coalesce(string_agg(item.description, ' + ' order by item.sort_order), '')
    into selected_quote_version_id, selected_source_mxn, selected_service
    from public.quotes as quote
    join public.quote_versions as version on version.id = quote.accepted_version_id
    left join public.quote_items as item on item.quote_version_id = version.id
    where quote.event_id = selected_event.id
      and quote.status = 'accepted'
    group by version.id, version.subtotal_mxn
    limit 1;
  end if;

  selected_commission_mxn := case selected_venue.commission_model
    when 'fixed_percentage' then selected_source_mxn * (coalesce(selected_venue.commission_percentage, 0) / 100)
    when 'fixed_amount' then coalesce(selected_venue.commission_fixed_amount, 0)
    else 0
  end;
  selected_subtotal_mxn := greatest(selected_source_mxn - selected_commission_mxn, 0);
  selected_iva_mxn := selected_subtotal_mxn * (coalesce(selected_venue.fiscal_iva_rate, 16) / 100);
  selected_iva_retention_mxn := case when selected_venue.fiscal_retains_iva
    then selected_subtotal_mxn * (coalesce(selected_venue.fiscal_iva_retention_rate, 10.6667) / 100)
    else 0
  end;
  selected_isr_retention_mxn := case when selected_venue.fiscal_retains_isr
    then selected_subtotal_mxn * (coalesce(selected_venue.fiscal_isr_retention_rate, 10) / 100)
    else 0
  end;
  selected_total_mxn := selected_subtotal_mxn + selected_iva_mxn
    - selected_iva_retention_mxn - selected_isr_retention_mxn;
  selected_unit_value_mxn := case when selected_event.guest_count > 0
    then selected_subtotal_mxn / selected_event.guest_count
    else 0
  end;

  select * into selected_factura
  from public.event_sat_facturas
  where event_id = selected_event.id
    and creation_source = 'auto_pv_confirmation'
  limit 1;

  selected_fiscal_profile_id := coalesce(
    selected_factura.fiscal_profile_id,
    selected_venue.fiscal_default_profile_id
  );

  select * into selected_profile
  from public.sat_fiscal_profiles
  where id = selected_fiscal_profile_id;

  selected_recipient_name := coalesce(
    nullif(selected_factura.recipient_name, ''),
    nullif(selected_venue.fiscal_legal_name, ''),
    selected_venue.name,
    selected_event.venue_name,
    ''
  );
  selected_recipient_rfc := coalesce(
    nullif(selected_factura.rfc, ''),
    nullif(selected_venue.fiscal_rfc, ''),
    ''
  );

  selected_accountant_request := upper(concat_ws(chr(10),
    concat('RFC EMISOR: ', coalesce(selected_profile.rfc, '')),
    concat('NOMBRE EMISOR: ', coalesce(selected_profile.legal_name, '')),
    concat('RFC RECEPTOR: ', selected_recipient_rfc),
    concat('NOMBRE RECEPTOR: ', selected_recipient_name),
    concat('NOVIOS: ', coalesce(nullif(selected_event.event_name, ''), selected_client_name, '')),
    concat('HOTEL: ', coalesce(selected_event.venue_name, '')),
    concat('FECHA: ', selected_event.event_date::text),
    concat('SERVICIO: ', selected_service),
    concat('PAX: ', selected_event.guest_count::text),
    concat(
      'SUBTOTAL: ',
      selected_subtotal_mxn::text,
      ' + IVA',
      case
        when selected_iva_retention_mxn > 0 or selected_isr_retention_mxn > 0
          then ', CON RETENCIONES'
        else ''
      end
    )
  ));

  if selected_factura.id is not null then
    update public.event_sat_facturas
    set venue_id = selected_event.venue_id,
        payment_partner_venue_id = selected_event.payment_partner_venue_id,
        fiscal_profile_id = coalesce(fiscal_profile_id, selected_venue.fiscal_default_profile_id),
        bank_account_id = coalesce(bank_account_id, selected_venue.fiscal_default_bank_account_id),
        recipient_name = coalesce(nullif(recipient_name, ''), nullif(selected_venue.fiscal_legal_name, ''), selected_venue.name, selected_event.venue_name, ''),
        rfc = coalesce(nullif(rfc, ''), selected_venue.fiscal_rfc, ''),
        tax_regime = coalesce(nullif(tax_regime, ''), selected_venue.fiscal_tax_regime, ''),
        cfdi_use = coalesce(nullif(cfdi_use, ''), selected_venue.fiscal_cfdi_use, ''),
        payment_method = coalesce(nullif(payment_method, ''), selected_venue.fiscal_payment_method, ''),
        payment_form = coalesce(nullif(payment_form, ''), selected_venue.fiscal_payment_form, ''),
        tax_object = coalesce(nullif(tax_object, ''), selected_venue.fiscal_tax_object, '02'),
        due_at = coalesce(due_at, public.get_sat_due_date(selected_event.event_date, selected_venue.fiscal_due_rule, selected_venue.fiscal_due_day)),
        pax = coalesce(pax, selected_event.guest_count),
        quote_version_id = case when status = 'pending' then selected_quote_version_id else quote_version_id end,
        source_total_mxn = case when status = 'pending' then selected_source_mxn else source_total_mxn end,
        commission_mxn = case when status = 'pending' then selected_commission_mxn else commission_mxn end,
        subtotal_mxn = case when status = 'pending' then selected_subtotal_mxn else subtotal_mxn end,
        iva_mxn = case when status = 'pending' then selected_iva_mxn else iva_mxn end,
        iva_retention_mxn = case when status = 'pending' then selected_iva_retention_mxn else iva_retention_mxn end,
        isr_retention_mxn = case when status = 'pending' then selected_isr_retention_mxn else isr_retention_mxn end,
        tax_total_mxn = case when status = 'pending' then greatest(selected_iva_mxn - selected_iva_retention_mxn - selected_isr_retention_mxn, 0) else tax_total_mxn end,
        total_mxn = case when status = 'pending' then selected_total_mxn else total_mxn end,
        unit_value_mxn = case when status = 'pending' then selected_unit_value_mxn else unit_value_mxn end,
        service_description = case when status = 'pending' then selected_service else service_description end,
        accountant_request_text = case when status = 'pending' then selected_accountant_request else accountant_request_text end,
        updated_at = now()
    where id = selected_factura.id;

    return selected_factura.id;
  end if;

  insert into public.event_sat_facturas (
    event_id, venue_id, payment_partner_venue_id, creation_source,
    recipient_type, fiscal_profile_id, bank_account_id, recipient_name,
    rfc, tax_regime, cfdi_use, payment_method, payment_form, tax_object,
    due_at, pax, quote_version_id, source_total_mxn, commission_mxn,
    subtotal_mxn, iva_mxn, iva_retention_mxn, isr_retention_mxn,
    tax_total_mxn, total_mxn, unit_value_mxn, service_description,
    accountant_request_text
  )
  values (
    selected_event.id, selected_event.venue_id, selected_event.payment_partner_venue_id,
    'auto_pv_confirmation', 'venue_hotel',
    selected_venue.fiscal_default_profile_id, selected_venue.fiscal_default_bank_account_id,
    selected_recipient_name, selected_recipient_rfc, selected_venue.fiscal_tax_regime,
    selected_venue.fiscal_cfdi_use, selected_venue.fiscal_payment_method,
    selected_venue.fiscal_payment_form, selected_venue.fiscal_tax_object,
    public.get_sat_due_date(selected_event.event_date, selected_venue.fiscal_due_rule, selected_venue.fiscal_due_day),
    selected_event.guest_count, selected_quote_version_id, selected_source_mxn,
    selected_commission_mxn, selected_subtotal_mxn, selected_iva_mxn,
    selected_iva_retention_mxn, selected_isr_retention_mxn,
    greatest(selected_iva_mxn - selected_iva_retention_mxn - selected_isr_retention_mxn, 0),
    selected_total_mxn, selected_unit_value_mxn, selected_service,
    selected_accountant_request
  )
  returning id into selected_factura.id;

  return selected_factura.id;
end;
$$;

create or replace function public.refresh_sat_factura_from_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_event_id uuid;
begin
  if tg_table_name = 'invoice_items' then
    select event_id into target_event_id
    from public.invoices
    where id = coalesce(new.invoice_id, old.invoice_id);
  else
    target_event_id := coalesce(new.event_id, old.event_id);
  end if;

  if target_event_id is not null then
    perform public.ensure_event_sat_factura(target_event_id);
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists refresh_sat_factura_from_invoice on public.invoices;
create trigger refresh_sat_factura_from_invoice
after insert or update of subtotal_mxn, status, invoice_type, quote_version_id
on public.invoices
for each row execute function public.refresh_sat_factura_from_invoice();

drop trigger if exists refresh_sat_factura_from_invoice_items on public.invoice_items;
create trigger refresh_sat_factura_from_invoice_items
after insert or update or delete
on public.invoice_items
for each row execute function public.refresh_sat_factura_from_invoice();

select public.ensure_event_sat_factura(factura.event_id)
from public.event_sat_facturas as factura
where factura.creation_source = 'auto_pv_confirmation'
  and factura.status = 'pending';

grant execute on function public.ensure_event_sat_factura(uuid)
to authenticated, service_role;
