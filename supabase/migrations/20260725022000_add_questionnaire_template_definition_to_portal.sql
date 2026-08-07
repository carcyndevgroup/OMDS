drop function if exists public.get_client_portal_questionnaires_by_key(uuid);
create or replace function public.get_client_portal_questionnaires_by_key(
  input_access_key uuid
)
returns table (
  questionnaire_id uuid,
  title text,
  status text,
  template_key text,
  template_definition jsonb,
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
    coalesce(template.definition, '{}'::jsonb),
    case
      when questionnaire.response_data <> '{}'::jsonb then questionnaire.response_data
      else prefill.data
    end,
    questionnaire.sent_at,
    questionnaire.submitted_at
  from portal_event as event
  join public.questionnaires as questionnaire on questionnaire.event_id = event.id
  left join public.questionnaire_templates as template
    on template.template_key = questionnaire.template_key
  cross join prefill
  where questionnaire.status in ('sent', 'submitted')
  order by questionnaire.created_at;
$$;
revoke all on function public.get_client_portal_questionnaires_by_key(uuid)
from public;
grant execute on function public.get_client_portal_questionnaires_by_key(uuid)
to anon, authenticated, service_role;
