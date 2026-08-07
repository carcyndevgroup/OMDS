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
  ) then
    raise exception 'client_event_not_found';
  end if;

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
    if selected_partner_id is null then
      raise exception 'payment_partner_required';
    end if;

    if not exists (
      select 1 from public.venues
      where id = selected_partner_id and is_preferred_vendor
    ) then
      raise exception 'invalid_payment_partner';
    end if;
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
    guest_count = (input->>'guestCount')::integer,
    venue_id = selected_venue_id,
    venue_name = selected_venue_name,
    notes = coalesce(input->>'notes', ''),
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

revoke all on function public.update_client_event(uuid, uuid, jsonb) from public;
grant execute on function public.update_client_event(uuid, uuid, jsonb)
to authenticated, service_role;
