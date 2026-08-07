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
  signed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with portal_event as (
    select event.id
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
    contract.signed_at
  from portal_event as event
  join public.contracts as contract on contract.event_id = event.id
  left join public.contract_templates as template on template.template_key = contract.template_key
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
  total_mxn numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with portal_event as (
    select event.id
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
    invoice.total_mxn
  from portal_event as event
  join public.invoices as invoice on invoice.event_id = event.id
  left join public.invoice_items as item on item.invoice_id = invoice.id
  where invoice.client_visible
    and invoice.status in ('draft', 'issued', 'payment_promised', 'paid')
  group by invoice.id
  order by invoice.created_at;
$$;

revoke all on function public.get_client_portal_invoices_by_key(uuid)
from public;
grant execute on function public.get_client_portal_invoices_by_key(uuid)
to anon, authenticated, service_role;
