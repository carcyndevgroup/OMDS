alter table public.client_portal_access
add column if not exists access_key uuid not null default gen_random_uuid(),
add column if not exists revoked_at timestamptz;

create unique index if not exists client_portal_access_key_idx
on public.client_portal_access(access_key);

create or replace function public.get_client_portal_access_by_key(
  input_access_key uuid
)
returns table (
  access_key uuid,
  event_id uuid,
  client_name text,
  event_date date,
  venue_name text,
  portal_enabled boolean,
  quotes_visible boolean,
  questionnaires_visible boolean,
  contracts_visible boolean,
  invoices_visible boolean,
  reviews_visible boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    access.access_key,
    access.event_id,
    trim(concat(coalesce(client.first_name, ''), ' ', coalesce(client.last_name, ''))),
    event.event_date,
    event.venue_name,
    access.portal_enabled,
    access.quotes_visible,
    access.questionnaires_visible,
    access.contracts_visible,
    access.invoices_visible,
    access.reviews_visible
  from public.client_portal_access as access
  join public.events as event on event.id = access.event_id
  left join public.event_contacts as contact
    on contact.event_id = event.id and contact.is_primary
  left join public.clients as client on client.id = contact.client_id
  where access.access_key = input_access_key
    and access.revoked_at is null
  limit 1;
$$;

revoke all on function public.get_client_portal_access_by_key(uuid)
from public;

grant execute on function public.get_client_portal_access_by_key(uuid)
to anon, authenticated, service_role;
