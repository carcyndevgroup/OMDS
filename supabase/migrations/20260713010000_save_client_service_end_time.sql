create or replace function public.create_client_event(
  input jsonb,
  source_lead_id uuid default null
)
returns table (client_id uuid, event_id uuid)
language plpgsql
set search_path = ''
as $$
declare
  new_client_id uuid;
  new_event_id uuid;
  selected_booking_type text := input->>'bookingType';
  selected_partner_id uuid := nullif(input->>'paymentPartnerVenueId', '')::uuid;
  selected_venue_id uuid := nullif(input->>'venueId', '')::uuid;
  selected_venue_name text := coalesce(input->>'venueName', '');
  selected_venue_is_pv boolean := false;
begin
  if selected_venue_id is not null then
    select name, is_preferred_vendor
    into selected_venue_name, selected_venue_is_pv
    from public.venues
    where id = selected_venue_id;
    if not found then raise exception 'venue_not_found'; end if;
  end if;

  if selected_venue_is_pv then
    selected_booking_type := 'preferred_vendor';
    selected_partner_id := selected_venue_id;
  elsif selected_booking_type = 'direct' then
    selected_partner_id := null;
  end if;

  if selected_booking_type = 'preferred_vendor' then
    if selected_partner_id is null then raise exception 'payment_partner_required'; end if;
    if not exists (
      select 1 from public.venues
      where id = selected_partner_id and is_preferred_vendor
    ) then raise exception 'invalid_payment_partner'; end if;
  end if;

  insert into public.clients (
    first_name, last_name, email, phone, company_name, street_address,
    city, state_province, postal_code, country, lead_source, instagram, facebook
  )
  values (
    input->>'firstName', input->>'lastName', input->>'email',
    input->>'phone', coalesce(input->>'companyName', ''),
    coalesce(input->>'streetAddress', ''), coalesce(input->>'city', ''),
    coalesce(input->>'stateProvince', ''), coalesce(input->>'postalCode', ''),
    coalesce(input->>'country', ''), input->>'leadSource',
    coalesce(input->>'instagram', ''), coalesce(input->>'facebook', '')
  )
  returning id into new_client_id;

  insert into public.events (
    event_type, event_date, service_start_time, service_end_time, guest_count,
    venue_id, venue_name, venue_sub_location_id, venue_sub_location_other,
    event_venue_contact_id, notes, operations_notes, internal_issue_notes,
    booking_status, booking_type, payment_partner_venue_id, source_lead_id
  )
  values (
    input->>'eventType', (input->>'eventDate')::date,
    nullif(input->>'serviceStartTime', '')::time,
    nullif(input->>'serviceEndTime', '')::time,
    (input->>'guestCount')::integer, selected_venue_id, selected_venue_name,
    nullif(input->>'venueSubLocationId', '')::uuid,
    coalesce(input->>'venueSubLocationOther', ''),
    nullif(input->>'eventVenueContactId', '')::uuid,
    coalesce(input->>'notes', ''), coalesce(input->>'operationsNotes', ''),
    coalesce(input->>'internalIssueNotes', ''),
    coalesce(input->>'bookingStatus', 'quote_requested'),
    selected_booking_type, selected_partner_id, source_lead_id
  )
  returning id into new_event_id;

  insert into public.event_contacts (event_id, client_id, role, is_primary)
  values (new_event_id, new_client_id, input->>'role', true);

  insert into public.event_services (event_id, service_id)
  select new_event_id, value
  from jsonb_array_elements_text(coalesce(input->'serviceIds', '[]'::jsonb));

  if source_lead_id is not null then
    update public.leads set status = 'converted'
    where id = source_lead_id
      and status in ('new', 'contacted', 'waiting_on_lead');
    if not found then raise exception 'lead_not_found'; end if;
  end if;

  return query select new_client_id, new_event_id;
end;
$$;

create or replace function public.update_client_event(
  target_client_id uuid,
  target_event_id uuid,
  input jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  selected_booking_type text := input->>'bookingType';
  selected_partner_id uuid := nullif(input->>'paymentPartnerVenueId', '')::uuid;
  selected_venue_id uuid := nullif(input->>'venueId', '')::uuid;
  selected_venue_name text := coalesce(input->>'venueName', '');
  selected_venue_is_pv boolean := false;
begin
  if not exists (
    select 1 from public.event_contacts
    where client_id = target_client_id and event_id = target_event_id
  ) then raise exception 'client_event_not_found'; end if;

  if selected_venue_id is not null then
    select name, is_preferred_vendor
    into selected_venue_name, selected_venue_is_pv
    from public.venues
    where id = selected_venue_id;
    if not found then raise exception 'venue_not_found'; end if;
  end if;

  if selected_venue_is_pv then
    selected_booking_type := 'preferred_vendor';
    selected_partner_id := selected_venue_id;
  elsif selected_booking_type = 'direct' then
    selected_partner_id := null;
  end if;

  if selected_booking_type = 'preferred_vendor' then
    if selected_partner_id is null then raise exception 'payment_partner_required'; end if;
    if not exists (
      select 1 from public.venues
      where id = selected_partner_id and is_preferred_vendor
    ) then raise exception 'invalid_payment_partner'; end if;
  end if;

  update public.clients
  set
    first_name = input->>'firstName',
    last_name = input->>'lastName',
    email = input->>'email',
    phone = input->>'phone',
    company_name = coalesce(input->>'companyName', ''),
    street_address = coalesce(input->>'streetAddress', ''),
    city = coalesce(input->>'city', ''),
    state_province = coalesce(input->>'stateProvince', ''),
    postal_code = coalesce(input->>'postalCode', ''),
    country = coalesce(input->>'country', ''),
    lead_source = input->>'leadSource',
    instagram = coalesce(input->>'instagram', ''),
    facebook = coalesce(input->>'facebook', '')
  where id = target_client_id;
  if not found then raise exception 'client_not_found'; end if;

  update public.events
  set
    event_type = input->>'eventType',
    event_date = (input->>'eventDate')::date,
    service_start_time = nullif(input->>'serviceStartTime', '')::time,
    service_end_time = nullif(input->>'serviceEndTime', '')::time,
    guest_count = (input->>'guestCount')::integer,
    venue_id = selected_venue_id,
    venue_name = selected_venue_name,
    venue_sub_location_id = nullif(input->>'venueSubLocationId', '')::uuid,
    venue_sub_location_other = coalesce(input->>'venueSubLocationOther', ''),
    event_venue_contact_id = nullif(input->>'eventVenueContactId', '')::uuid,
    notes = coalesce(input->>'notes', ''),
    operations_notes = coalesce(input->>'operationsNotes', ''),
    internal_issue_notes = coalesce(input->>'internalIssueNotes', ''),
    booking_status = input->>'bookingStatus',
    booking_type = selected_booking_type,
    payment_partner_venue_id = selected_partner_id
  where id = target_event_id;
  if not found then raise exception 'event_not_found'; end if;

  update public.event_contacts
  set role = input->>'role'
  where client_id = target_client_id and event_id = target_event_id;

  delete from public.event_services where event_id = target_event_id;
  insert into public.event_services (event_id, service_id)
  select target_event_id, value
  from jsonb_array_elements_text(coalesce(input->'serviceIds', '[]'::jsonb));
end;
$$;

grant execute on function public.create_client_event(jsonb, uuid)
to authenticated, service_role;

grant execute on function public.update_client_event(uuid, uuid, jsonb)
to authenticated, service_role;
