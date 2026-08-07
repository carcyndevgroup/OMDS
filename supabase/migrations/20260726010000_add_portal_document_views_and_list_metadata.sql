create table if not exists public.client_portal_document_views (
  access_key uuid not null references public.client_portal_access(access_key) on delete cascade,
  document_kind text not null check (document_kind in ('quote', 'contract', 'invoice', 'questionnaire')),
  document_id uuid not null,
  viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (access_key, document_kind, document_id)
);

create or replace function public.mark_client_portal_document_viewed_by_key(
  input_access_key uuid,
  input_document_kind text,
  input_document_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event_id uuid;
  can_view_quotes boolean;
  can_view_questionnaires boolean;
  can_view_contracts boolean;
  can_view_invoices boolean;
  is_allowed boolean := false;
begin
  if input_document_kind not in ('quote', 'contract', 'invoice', 'questionnaire') then
    raise exception 'invalid_document_kind';
  end if;

  select
    access.event_id,
    access.quotes_visible,
    access.questionnaires_visible,
    access.contracts_visible,
    access.invoices_visible
  into
    target_event_id,
    can_view_quotes,
    can_view_questionnaires,
    can_view_contracts,
    can_view_invoices
  from public.client_portal_access as access
  where access.access_key = input_access_key
    and access.revoked_at is null
  limit 1;

  if target_event_id is null then
    raise exception 'portal_access_not_available';
  end if;

  if input_document_kind = 'quote' then
    select exists(
      select 1
      from public.quotes as quote
      where quote.id = input_document_id
        and quote.event_id = target_event_id
        and can_view_quotes
        and quote.status in ('sent', 'viewed', 'accepted', 'expired')
    ) into is_allowed;
  elsif input_document_kind = 'questionnaire' then
    select exists(
      select 1
      from public.questionnaires as questionnaire
      where questionnaire.id = input_document_id
        and questionnaire.event_id = target_event_id
        and can_view_questionnaires
        and questionnaire.status in ('sent', 'submitted')
    ) into is_allowed;
  elsif input_document_kind = 'contract' then
    select exists(
      select 1
      from public.contracts as contract
      where contract.id = input_document_id
        and contract.event_id = target_event_id
        and can_view_contracts
        and contract.status in ('sent', 'signed')
    ) into is_allowed;
  elsif input_document_kind = 'invoice' then
    select exists(
      select 1
      from public.invoices as invoice
      where invoice.id = input_document_id
        and invoice.event_id = target_event_id
        and can_view_invoices
        and invoice.client_visible
        and invoice.status in ('draft', 'issued', 'payment_promised', 'paid')
    ) into is_allowed;
  end if;

  if not is_allowed then
    raise exception 'document_not_available';
  end if;

  insert into public.client_portal_document_views as views (
    access_key,
    document_kind,
    document_id,
    viewed_at,
    updated_at
  )
  values (
    input_access_key,
    input_document_kind,
    input_document_id,
    now(),
    now()
  )
  on conflict (access_key, document_kind, document_id) do update
  set viewed_at = excluded.viewed_at,
      updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.mark_client_portal_document_viewed_by_key(uuid, text, uuid)
from public;

grant execute on function public.mark_client_portal_document_viewed_by_key(uuid, text, uuid)
to anon, authenticated, service_role;

drop function if exists public.get_client_portal_quotes_by_key(uuid);

create or replace function public.get_client_portal_quotes_by_key(
  input_access_key uuid
)
returns table (
  quote_id uuid,
  title text,
  quote_status text,
  version_id uuid,
  version_number integer,
  version_status text,
  issued_at timestamptz,
  display_currency text,
  exchange_rate_to_mxn numeric,
  exchange_rate_margin_percent numeric,
  apply_exchange_rate_margin boolean,
  applies_iva_tax boolean,
  applies_iva_retention boolean,
  applies_isr_retention boolean,
  expires_at timestamptz,
  is_expired boolean,
  has_been_viewed boolean,
  subtotal_mxn numeric,
  tax_total_mxn numeric,
  iva_tax_mxn numeric,
  iva_retention_mxn numeric,
  isr_retention_mxn numeric,
  total_mxn numeric,
  items jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    quote.id,
    quote.title,
    case when version.expires_at is not null and version.expires_at < now() then 'expired' else quote.status end,
    version.id,
    version.version_number,
    case when version.expires_at is not null and version.expires_at < now() then 'expired' else version.status end,
    coalesce(version.sent_at, version.created_at),
    version.display_currency,
    version.exchange_rate_to_mxn,
    version.exchange_rate_margin_percent,
    version.apply_exchange_rate_margin,
    version.applies_iva_tax,
    version.applies_iva_retention,
    version.applies_isr_retention,
    version.expires_at,
    version.expires_at is not null and version.expires_at < now(),
    view_state.document_id is not null,
    version.subtotal_mxn,
    version.tax_total_mxn,
    version.iva_tax_mxn,
    version.iva_retention_mxn,
    version.isr_retention_mxn,
    version.total_mxn,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'description', item.description,
          'details', item.details,
          'quantity', item.quantity,
          'unitPriceMxn', item.unit_price_mxn,
          'lineTotalMxn', item.line_total_mxn,
          'sortOrder', item.sort_order
        )
        order by item.sort_order
      ) filter (where item.id is not null),
      '[]'::jsonb
    )
  from public.client_portal_access as access
  join public.quotes as quote on quote.event_id = access.event_id
  join lateral (
    select *
    from public.quote_versions as quote_version
    where quote_version.quote_id = quote.id
      and quote_version.status in ('sent', 'viewed', 'accepted', 'expired')
    order by quote_version.version_number desc
    limit 1
  ) as version on true
  left join public.client_portal_document_views as view_state
    on view_state.access_key = access.access_key
   and view_state.document_kind = 'quote'
   and view_state.document_id = quote.id
  left join public.quote_items as item on item.quote_version_id = version.id
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.quotes_visible
    and quote.status in ('sent', 'viewed', 'accepted', 'expired')
  group by
    quote.id,
    quote.title,
    quote.status,
    quote.created_at,
    version.id,
    version.version_number,
    version.status,
    version.sent_at,
    version.created_at,
    version.display_currency,
    version.exchange_rate_to_mxn,
    version.exchange_rate_margin_percent,
    version.apply_exchange_rate_margin,
    version.applies_iva_tax,
    version.applies_iva_retention,
    version.applies_isr_retention,
    version.expires_at,
    version.subtotal_mxn,
    version.tax_total_mxn,
    version.iva_tax_mxn,
    version.iva_retention_mxn,
    version.isr_retention_mxn,
    version.total_mxn,
    view_state.document_id
  order by quote.created_at;
$$;

revoke all on function public.get_client_portal_quotes_by_key(uuid)
from public;

grant execute on function public.get_client_portal_quotes_by_key(uuid)
to anon, authenticated, service_role;

drop function if exists public.get_client_portal_questionnaires_by_key(uuid);

create or replace function public.get_client_portal_questionnaires_by_key(
  input_access_key uuid
)
returns table (
  questionnaire_id uuid,
  title text,
  status text,
  template_key text,
  response_data jsonb,
  sent_at timestamptz,
  submitted_at timestamptz,
  has_been_viewed boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with portal_event as (
    select event.*
    from public.client_portal_access as access
    join public.events as event on event.id = access.event_id
    where access.access_key = input_access_key
      and access.revoked_at is null
      and access.questionnaires_visible
    limit 1
  ),
  access_row as (
    select access.access_key
    from public.client_portal_access as access
    where access.access_key = input_access_key
      and access.revoked_at is null
    limit 1
  ),
  primary_client as (
    select client.*, contact.role
    from portal_event as event
    join public.event_contacts as contact
      on contact.event_id = event.id and contact.is_primary
    join public.clients as client on client.id = contact.client_id
    limit 1
  ),
  extra_clients as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'firstName', client.first_name,
      'lastName', client.last_name,
      'email', client.email,
      'phone', client.phone,
      'role', contact.role
    ) order by client.created_at) filter (where client.id is not null), '[]'::jsonb) as items
    from portal_event as event
    left join public.event_contacts as contact
      on contact.event_id = event.id and not contact.is_primary
    left join public.clients as client on client.id = contact.client_id
  ),
  assigned_contact as (
    select contact.*
    from portal_event as event
    left join public.event_venue_contacts as contact
      on contact.id = event.assigned_event_venue_contact_id
    limit 1
  ),
  planner_roles as (
    select
      coalesce(jsonb_agg(jsonb_build_object(
        'company', planner.company_name,
        'email', planner.email,
        'facebook', '',
        'firstName', split_part(planner.name, ' ', 1),
        'instagram', planner.instagram,
        'lastName', trim(substr(planner.name, length(split_part(planner.name, ' ', 1)) + 1)),
        'phone', planner.phone,
        'primaryEventContact', case when link.is_primary then 'yes' else 'no' end
      )) filter (where link.role <> 'day_of_coordinator'), '[]'::jsonb) as planners,
      coalesce(jsonb_agg(jsonb_build_object(
        'company', planner.company_name,
        'email', planner.email,
        'facebook', '',
        'firstName', split_part(planner.name, ' ', 1),
        'instagram', planner.instagram,
        'lastName', trim(substr(planner.name, length(split_part(planner.name, ' ', 1)) + 1)),
        'phone', planner.phone,
        'primaryEventContact', case when link.is_primary then 'yes' else 'no' end
      )) filter (where link.role = 'day_of_coordinator'), '[]'::jsonb) as coordinators
    from portal_event as event
    left join public.event_planners as link on link.event_id = event.id
    left join public.planners as planner on planner.id = link.planner_id
  ),
  prefill as (
    select jsonb_build_object(
      'client', jsonb_build_object(
        'additionalClients', extra_clients.items,
        'address', trim(concat_ws(', ',
          nullif(primary_client.street_address, ''),
          nullif(primary_client.city, ''),
          nullif(primary_client.state_province, ''),
          nullif(primary_client.postal_code, ''),
          nullif(primary_client.country, '')
        )),
        'email', coalesce(primary_client.email, ''),
        'facebook', coalesce(primary_client.facebook, ''),
        'firstName', coalesce(primary_client.first_name, ''),
        'instagram', coalesce(primary_client.instagram, ''),
        'lastName', coalesce(primary_client.last_name, ''),
        'legalFirstName', coalesce(nullif(primary_client.legal_first_name, ''), primary_client.first_name, ''),
        'legalLastName', coalesce(nullif(primary_client.legal_last_name, ''), primary_client.last_name, ''),
        'phone', coalesce(primary_client.phone, ''),
        'preferredCommunicationMethod', coalesce(primary_client.preferred_communication_method, 'email'),
        'role', coalesce(primary_client.role, '')
      ),
      'event', jsonb_build_object(
        'eventDate', event.event_date,
        'eventHashtags', event.event_hashtags,
        'eventName', event.event_name,
        'eventType', event.event_type,
        'guestCount', event.guest_count,
        'marqueeNames', event.marquee_sign_names,
        'serviceEndTime', coalesce(event.service_end_time::text, ''),
        'serviceLocationDescription', event.service_location_description,
        'serviceStartTime', coalesce(event.service_start_time::text, '')
      ),
      'venue', jsonb_build_object(
        'address', event.venue_name,
        'assignedContact', jsonb_build_object(
          'email', coalesce(assigned_contact.email, ''),
          'name', coalesce(assigned_contact.name, ''),
          'phone', coalesce(assigned_contact.phone, ''),
          'role', coalesce(assigned_contact.role, '')
        ),
        'name', event.venue_name,
        'powerSupplyAccess', event.power_supply_access,
        'powerSupplyNotes', event.power_supply_notes
      ),
      'externalPlanner', coalesce(planner_roles.planners->0, '{}'::jsonb),
      'dayOfCoordinator', coalesce(planner_roles.coordinators->0, '{}'::jsonb),
      'additional', jsonb_build_object(
        'operationalNotes', event.client_operational_notes,
        'specialRequests', event.special_requests
      )
    ) as data
    from portal_event as event
    cross join primary_client
    cross join extra_clients
    cross join assigned_contact
    cross join planner_roles
  )
  select
    questionnaire.id,
    questionnaire.title,
    questionnaire.status,
    questionnaire.template_key,
    case
      when questionnaire.response_data <> '{}'::jsonb then questionnaire.response_data
      else prefill.data
    end,
    questionnaire.sent_at,
    questionnaire.submitted_at,
    view_state.document_id is not null
  from portal_event as event
  join public.questionnaires as questionnaire on questionnaire.event_id = event.id
  cross join prefill
  cross join access_row
  left join public.client_portal_document_views as view_state
    on view_state.access_key = access_row.access_key
   and view_state.document_kind = 'questionnaire'
   and view_state.document_id = questionnaire.id
  where questionnaire.status in ('sent', 'submitted')
  order by questionnaire.created_at;
$$;

revoke all on function public.get_client_portal_questionnaires_by_key(uuid)
from public;

grant execute on function public.get_client_portal_questionnaires_by_key(uuid)
to anon, authenticated, service_role;

drop function if exists public.get_client_portal_contracts_by_key(uuid);

create or replace function public.get_client_portal_contracts_by_key(
  input_access_key uuid
)
returns table (
  contract_id uuid,
  title text,
  status text,
  template_key text,
  body text,
  issued_at timestamptz,
  signed_at timestamptz,
  version_number integer,
  has_been_viewed boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with portal_event as (
    select event.id, access.access_key
    from public.client_portal_access as access
    join public.events as event on event.id = access.event_id
    where access.access_key = input_access_key
      and access.revoked_at is null
      and access.contracts_visible
    limit 1
  )
  select
    contract.id as contract_id,
    contract.title,
    contract.status,
    contract.template_key,
    coalesce(template.body, '') as body,
    coalesce(contract.sent_at, contract.created_at) as issued_at,
    contract.signed_at,
    1 as version_number,
    view_state.document_id is not null as has_been_viewed
  from portal_event as event
  join public.contracts as contract on contract.event_id = event.id
  left join public.contract_templates as template on template.template_key = contract.template_key
  left join public.client_portal_document_views as view_state
    on view_state.access_key = event.access_key
   and view_state.document_kind = 'contract'
   and view_state.document_id = contract.id
  where contract.status in ('sent', 'signed')
  order by contract.created_at;
$$;

revoke all on function public.get_client_portal_contracts_by_key(uuid)
from public;

grant execute on function public.get_client_portal_contracts_by_key(uuid)
to anon, authenticated, service_role;

drop function if exists public.get_client_portal_invoices_by_key(uuid);

create or replace function public.get_client_portal_invoices_by_key(
  input_access_key uuid
)
returns table (
  invoice_id uuid,
  client_visible boolean,
  contract_id uuid,
  display_currency text,
  due_at timestamptz,
  invoice_type text,
  installment_key text,
  issued_at timestamptz,
  items jsonb,
  paid_at timestamptz,
  payment_promised_at timestamptz,
  status text,
  subtotal_mxn numeric,
  tax_total_mxn numeric,
  total_mxn numeric,
  has_been_viewed boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with portal_event as (
    select event.id, access.access_key
    from public.client_portal_access as access
    join public.events as event on event.id = access.event_id
    where access.access_key = input_access_key
      and access.revoked_at is null
      and access.invoices_visible
    limit 1
  )
  select
    invoice.id as invoice_id,
    invoice.client_visible,
    invoice.contract_id,
    invoice.display_currency,
    invoice.due_at,
    invoice.invoice_type,
    invoice.installment_key,
    invoice.issued_at,
    coalesce(jsonb_agg(jsonb_build_object(
      'description', item.description,
      'details', item.details,
      'lineTotalMxn', item.line_total_mxn,
      'quantity', item.quantity,
      'sortOrder', item.sort_order,
      'unitPriceMxn', item.unit_price_mxn
    ) order by item.sort_order) filter (where item.id is not null), '[]'::jsonb) as items,
    invoice.paid_at,
    invoice.payment_promised_at,
    invoice.status,
    invoice.subtotal_mxn,
    invoice.tax_total_mxn,
    invoice.total_mxn,
    view_state.document_id is not null as has_been_viewed
  from portal_event as event
  join public.invoices as invoice on invoice.event_id = event.id
  left join public.client_portal_document_views as view_state
    on view_state.access_key = event.access_key
   and view_state.document_kind = 'invoice'
   and view_state.document_id = invoice.id
  left join public.invoice_items as item on item.invoice_id = invoice.id
  where invoice.client_visible
    and invoice.status in ('draft', 'issued', 'payment_promised', 'paid')
  group by invoice.id, view_state.document_id
  order by invoice.created_at;
$$;

revoke all on function public.get_client_portal_invoices_by_key(uuid)
from public;

grant execute on function public.get_client_portal_invoices_by_key(uuid)
to anon, authenticated, service_role;
