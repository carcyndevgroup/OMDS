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
  exchange_rate_margin_percent numeric,
  apply_exchange_rate_margin boolean,
  expires_at timestamptz,
  is_expired boolean,
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
    case
      when version.expires_at is not null and version.expires_at < now()
        then 'expired'
      else quote.status
    end,
    version.id,
    version.version_number,
    case
      when version.expires_at is not null and version.expires_at < now()
        then 'expired'
      else version.status
    end,
    version.display_currency,
    version.exchange_rate_to_mxn,
    version.exchange_rate_margin_percent,
    version.apply_exchange_rate_margin,
    version.expires_at,
    version.expires_at is not null and version.expires_at < now(),
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
      and quote_version.status in ('sent', 'viewed', 'accepted', 'expired')
    order by quote_version.version_number desc
    limit 1
  ) as version on true
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
    version.display_currency,
    version.exchange_rate_to_mxn,
    version.exchange_rate_margin_percent,
    version.apply_exchange_rate_margin,
    version.expires_at,
    version.subtotal_mxn,
    version.tax_total_mxn,
    version.total_mxn
  order by quote.created_at;
$$;

create or replace function public.respond_client_portal_quote_by_key(
  input_access_key uuid,
  input_quote_id uuid,
  input_action text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event_id uuid;
  target_quote_id uuid;
  target_version_id uuid;
  target_expires_at timestamptz;
begin
  if input_action not in ('accept', 'decline') then
    raise exception 'invalid_quote_action';
  end if;

  select access.event_id, quote.id, version.id, version.expires_at
  into target_event_id, target_quote_id, target_version_id, target_expires_at
  from public.client_portal_access as access
  join public.quotes as quote on quote.event_id = access.event_id
  join lateral (
    select *
    from public.quote_versions as quote_version
    where quote_version.quote_id = quote.id
      and quote_version.status in ('sent', 'viewed')
    order by quote_version.version_number desc
    limit 1
  ) as version on true
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.quotes_visible
    and quote.id = input_quote_id
    and quote.status in ('sent', 'viewed')
  limit 1;

  if target_quote_id is null then
    raise exception 'quote_not_available';
  end if;

  if input_action = 'accept'
    and target_expires_at is not null
    and target_expires_at < now() then
    update public.quotes set status = 'expired' where id = target_quote_id;
    update public.quote_versions set status = 'expired' where id = target_version_id;
    perform public.sync_client_portal_access(target_event_id);
    raise exception 'quote_expired';
  end if;

  if input_action = 'accept' then
    update public.quotes
    set accepted_version_id = null, status = 'declined'
    where event_id = target_event_id
      and id <> target_quote_id
      and status in ('sent', 'viewed');

    update public.quote_versions
    set status = 'declined'
    where quote_id in (
      select id from public.quotes
      where event_id = target_event_id and id <> target_quote_id
    )
      and status in ('sent', 'viewed');

    update public.quotes
    set accepted_version_id = target_version_id, status = 'accepted'
    where id = target_quote_id;

    update public.quote_versions
    set accepted_at = now(), status = 'accepted'
    where id = target_version_id;

    update public.events set booking_status = 'tentative_hold'
    where id = target_event_id;
  else
    update public.quotes set status = 'declined' where id = target_quote_id;
    update public.quote_versions set status = 'declined' where id = target_version_id;
  end if;

  perform public.sync_client_portal_access(target_event_id);
end;
$$;

revoke all on function public.get_client_portal_quotes_by_key(uuid) from public;
revoke all on function public.respond_client_portal_quote_by_key(uuid, uuid, text)
from public;

grant execute on function public.get_client_portal_quotes_by_key(uuid)
to anon, authenticated, service_role;

grant execute on function public.respond_client_portal_quote_by_key(uuid, uuid, text)
to anon, authenticated, service_role;
