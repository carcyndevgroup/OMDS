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
  display_currency text,
  exchange_rate_to_mxn numeric,
  subtotal_mxn numeric,
  tax_total_mxn numeric,
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
    quote.status,
    version.id,
    version.version_number,
    version.status,
    version.display_currency,
    version.exchange_rate_to_mxn,
    version.subtotal_mxn,
    version.tax_total_mxn,
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
    ) as items
  from public.client_portal_access as access
  join public.quotes as quote on quote.event_id = access.event_id
  join lateral (
    select *
    from public.quote_versions as quote_version
    where quote_version.quote_id = quote.id
      and quote_version.status in ('sent', 'viewed', 'accepted')
    order by quote_version.version_number desc
    limit 1
  ) as version on true
  left join public.quote_items as item on item.quote_version_id = version.id
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.quotes_visible
    and quote.status in ('sent', 'viewed', 'accepted')
  group by
    quote.id,
    quote.title,
    quote.status,
    quote.created_at,
    version.id,
    version.version_number,
    version.status,
    version.display_currency,
    version.exchange_rate_to_mxn,
    version.subtotal_mxn,
    version.tax_total_mxn,
    version.total_mxn
  order by quote.created_at;
$$;

revoke all on function public.get_client_portal_quotes_by_key(uuid)
from public;

grant execute on function public.get_client_portal_quotes_by_key(uuid)
to anon, authenticated, service_role;
