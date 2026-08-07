update public.contracts as contract
set contract_data = jsonb_set(
  coalesce(contract.contract_data, '{}'::jsonb),
  '{body}',
  to_jsonb(template.body),
  true
)
from public.contract_templates as template
where template.template_key = contract.template_key
  and coalesce(contract.contract_data->>'body', '') = ''
  and coalesce(template.body, '') <> '';

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
    coalesce(nullif(contract.contract_data->>'body', ''), template.body, '') as body,
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
