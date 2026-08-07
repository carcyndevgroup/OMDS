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
  submitted_at timestamptz
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
    questionnaire.submitted_at
  from portal_event as event
  join public.questionnaires as questionnaire on questionnaire.event_id = event.id
  cross join prefill
  where questionnaire.status in ('sent', 'submitted')
  order by questionnaire.created_at;
$$;
revoke all on function public.get_client_portal_questionnaires_by_key(uuid)
from public;
grant execute on function public.get_client_portal_questionnaires_by_key(uuid)
to anon, authenticated, service_role;
insert into public.questionnaires (
  event_id, template_key, title, status, sent_at, review_status
)
select
  quote.event_id,
  'new_booking',
  'New Booking Questionnaire',
  'sent',
  now(),
  'not_started'
from public.quotes as quote
where quote.status = 'accepted'
on conflict (event_id, template_key) do update
set
  sent_at = coalesce(public.questionnaires.sent_at, now()),
  status = case
    when public.questionnaires.status = 'draft' then 'sent'
    else public.questionnaires.status
  end;
do $$
declare
  accepted_event record;
begin
  for accepted_event in
    select distinct event_id from public.quotes where status = 'accepted'
  loop
    perform public.sync_client_portal_access(accepted_event.event_id);
  end loop;
end;
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
  selected_status text;
begin
  if input_action not in ('accept', 'decline') then
    raise exception 'invalid_quote_action';
  end if;
  select
    access.event_id,
    quote.id,
    version.id
  into target_event_id, target_quote_id, target_version_id
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
    insert into public.questionnaires (
      event_id, template_key, title, status, sent_at, review_status
    )
    values (
      target_event_id, 'new_booking', 'New Booking Questionnaire',
      'sent', now(), 'not_started'
    )
    on conflict (event_id, template_key) do update
    set
      sent_at = coalesce(public.questionnaires.sent_at, now()),
      status = case
        when public.questionnaires.status = 'draft' then 'sent'
        else public.questionnaires.status
      end;

    update public.events
    set booking_status = 'tentative_hold'
    where id = target_event_id;
  else
    selected_status := 'declined';
    update public.quotes
    set status = selected_status
    where id = target_quote_id;

    update public.quote_versions
    set status = selected_status
    where id = target_version_id;
  end if;
  perform public.sync_client_portal_access(target_event_id);
end;
$$;
revoke all on function public.respond_client_portal_quote_by_key(uuid, uuid, text)
from public;
grant execute on function public.respond_client_portal_quote_by_key(uuid, uuid, text)
to anon, authenticated, service_role;
