create or replace function public.apply_questionnaire_additional_client(
  selected_event_id uuid,
  selected_lead_source text,
  additional_client jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  contact_role text := coalesce(nullif(additional_client->>'role', ''), 'other');
  existing_client_id uuid;
  submitted_email text := coalesce(additional_client->>'email', '');
  submitted_first_name text := coalesce(additional_client->>'firstName', '');
  submitted_last_name text := coalesce(additional_client->>'lastName', '');
  submitted_phone text := coalesce(additional_client->>'phone', '');
begin
  if submitted_first_name = '' and submitted_last_name = ''
    and submitted_email = '' and submitted_phone = '' then
    return;
  end if;

  if contact_role not in (
    'bride', 'groom', 'parent_family', 'external_planner',
    'hotel_resort', 'private_venue', 'other'
  ) then
    contact_role := 'other';
  end if;

  select id into existing_client_id
  from public.clients
  where (submitted_email <> '' and lower(email) = lower(submitted_email))
     or (
      submitted_email = ''
      and submitted_phone <> ''
      and phone = submitted_phone
      and lower(first_name) = lower(submitted_first_name)
      and lower(last_name) = lower(submitted_last_name)
    )
  order by case when lower(email) = lower(submitted_email) then 0 else 1 end
  limit 1;

  if existing_client_id is null then
    insert into public.clients (first_name, last_name, email, phone, lead_source)
    values (
      submitted_first_name,
      submitted_last_name,
      submitted_email,
      submitted_phone,
      selected_lead_source
    )
    returning id into existing_client_id;
  else
    update public.clients
    set
      first_name = case when first_name = '' then submitted_first_name else first_name end,
      last_name = case when last_name = '' then submitted_last_name else last_name end,
      email = case when email = '' then submitted_email else email end,
      phone = case when phone = '' then submitted_phone else phone end
    where id = existing_client_id;
  end if;

  insert into public.event_contacts (event_id, client_id, role, is_primary)
  values (selected_event_id, existing_client_id, contact_role, false)
  on conflict (event_id, client_id) do update
  set role = excluded.role;
end;
$$;

create or replace function public.apply_questionnaire_planner(
  selected_event_id uuid,
  planner_payload jsonb,
  planner_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_planner_id uuid;
  planner_name text;
  submitted_company text := coalesce(planner_payload->>'company', '');
  submitted_email text := coalesce(planner_payload->>'email', '');
  submitted_first_name text := coalesce(planner_payload->>'firstName', '');
  submitted_instagram text := coalesce(planner_payload->>'instagram', '');
  submitted_last_name text := coalesce(planner_payload->>'lastName', '');
  submitted_phone text := coalesce(planner_payload->>'phone', '');
  submitted_primary text := coalesce(planner_payload->>'primaryEventContact', 'no');
begin
  planner_name := trim(concat(submitted_first_name, ' ', submitted_last_name));

  if planner_name = '' then
    planner_name := submitted_company;
  end if;

  if planner_name = '' and submitted_email = '' and submitted_phone = '' then
    return;
  end if;

  select id into existing_planner_id
  from public.planners
  where (submitted_email <> '' and lower(email) = lower(submitted_email))
     or (
      submitted_email = ''
      and submitted_phone <> ''
      and phone = submitted_phone
      and lower(name) = lower(planner_name)
    )
  order by case when lower(email) = lower(submitted_email) then 0 else 1 end
  limit 1;

  if existing_planner_id is null then
    insert into public.planners (
      name, company_name, email, phone, instagram,
      preferred_contact_method, notes
    )
    values (
      planner_name,
      submitted_company,
      submitted_email,
      submitted_phone,
      submitted_instagram,
      case
        when submitted_email <> '' then 'email'
        when submitted_phone <> '' then 'phone'
        when submitted_instagram <> '' then 'instagram'
        else 'none'
      end,
      'Created from approved booking questionnaire.'
    )
    returning id into existing_planner_id;
  else
    update public.planners
    set
      company_name = case when company_name = '' then submitted_company else company_name end,
      email = case when email = '' then submitted_email else email end,
      phone = case when phone = '' then submitted_phone else phone end,
      instagram = case when instagram = '' then submitted_instagram else instagram end
    where id = existing_planner_id;
  end if;

  insert into public.event_planners (
    event_id, planner_id, role, is_primary, commission_eligible, notes
  )
  values (
    selected_event_id,
    existing_planner_id,
    planner_role,
    planner_role = 'primary_planner',
    false,
    concat(
      'Linked from approved booking questionnaire. Primary event contact: ',
      submitted_primary,
      '. Review commission eligibility.'
    )
  )
  on conflict (event_id, planner_id) do update
  set
    role = excluded.role,
    notes = case
      when public.event_planners.notes = '' then excluded.notes
      else public.event_planners.notes
    end;
end;
$$;

revoke all on function public.apply_questionnaire_additional_client(uuid, text, jsonb)
from public;

revoke all on function public.apply_questionnaire_planner(uuid, jsonb, text)
from public;
