alter table public.questionnaires
add column if not exists applied_at timestamptz,
add column if not exists apply_notes text not null default '';

create or replace function public.apply_approved_questionnaire_data(
  input_questionnaire_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_event_id uuid;
  selected_client_id uuid;
  response jsonb;
  contact_id uuid;
  venue_contact jsonb;
  start_time text;
  end_time text;
  power_access text;
begin
  if not (select private.is_crm_user()) then
    raise exception 'unauthorized';
  end if;

  select event_id, response_data
  into selected_event_id, response
  from public.questionnaires
  where id = input_questionnaire_id
    and status = 'submitted'
    and review_status = 'approved';

  if selected_event_id is null then
    raise exception 'questionnaire_not_approved';
  end if;

  select client_id
  into selected_client_id
  from public.event_contacts
  where event_id = selected_event_id and is_primary
  limit 1;

  if selected_client_id is not null then
    update public.clients
    set
      legal_first_name = coalesce(nullif(response #>> '{client,legalFirstName}', ''), legal_first_name),
      legal_last_name = coalesce(nullif(response #>> '{client,legalLastName}', ''), legal_last_name),
      phone = coalesce(nullif(response #>> '{client,phone}', ''), phone),
      instagram = coalesce(nullif(response #>> '{client,instagram}', ''), instagram),
      facebook = coalesce(nullif(response #>> '{client,facebook}', ''), facebook),
      preferred_communication_method = case
        when response #>> '{client,preferredCommunicationMethod}' in ('email', 'whatsapp', 'phone')
          then response #>> '{client,preferredCommunicationMethod}'
        else preferred_communication_method
      end
    where id = selected_client_id;
  end if;

  start_time := nullif(response #>> '{event,serviceStartTime}', '');
  end_time := nullif(response #>> '{event,serviceEndTime}', '');
  power_access := response #>> '{venue,powerSupplyAccess}';

  update public.events
  set
    event_name = coalesce(nullif(response #>> '{event,eventName}', ''), event_name),
    marquee_sign_names = coalesce(nullif(response #>> '{event,marqueeNames}', ''), marquee_sign_names),
    event_hashtags = coalesce(nullif(response #>> '{event,eventHashtags}', ''), event_hashtags),
    service_start_time = case
      when start_time ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' then start_time::time
      else service_start_time
    end,
    service_end_time = case
      when end_time ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$' then end_time::time
      else service_end_time
    end,
    service_location_description = coalesce(
      nullif(response #>> '{event,serviceLocationDescription}', ''),
      service_location_description
    ),
    power_supply_access = case
      when power_access in ('yes', 'no', 'not_sure') then power_access
      else power_supply_access
    end,
    power_supply_notes = coalesce(nullif(response #>> '{venue,powerSupplyNotes}', ''), power_supply_notes),
    special_requests = coalesce(nullif(response #>> '{additional,specialRequests}', ''), special_requests),
    client_operational_notes = coalesce(
      nullif(response #>> '{additional,operationalNotes}', ''),
      client_operational_notes
    )
  where id = selected_event_id;

  venue_contact := response #> '{venue,assignedContact}';

  if nullif(venue_contact->>'name', '') is not null then
    insert into public.event_venue_contacts (
      event_id, name, role, email, phone, notes
    )
    values (
      selected_event_id,
      venue_contact->>'name',
      coalesce(venue_contact->>'role', ''),
      coalesce(venue_contact->>'email', ''),
      coalesce(venue_contact->>'phone', ''),
      'Created from approved booking questionnaire.'
    )
    returning id into contact_id;

    update public.events
    set assigned_event_venue_contact_id = contact_id
    where id = selected_event_id;
  end if;

  update public.questionnaires
  set
    applied_at = now(),
    apply_notes = 'Applied approved questionnaire data to official booking records.'
  where id = input_questionnaire_id;
end;
$$;

revoke all on function public.apply_approved_questionnaire_data(uuid)
from public;

grant execute on function public.apply_approved_questionnaire_data(uuid)
to authenticated, service_role;
