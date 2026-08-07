alter table public.preferred_partners rename to venues;

alter table public.venues
add column is_preferred_vendor boolean not null default true;

insert into public.venues (name, is_preferred_vendor)
values
  ('Alquimia Hotel Boutique Tulum', false),
  ('Amansala Resort', false),
  ('Barceló Maya Colonial', false),
  ('Barceló Maya Palace', false),
  ('Barceló Maya Riviera', false),
  ('Blue Venado - Beach Wedding', false),
  ('Blue Venado Beach Club', false),
  ('Fairmont Mayakoba', false),
  ('Garza Blanca Cancun', false),
  ('Grand Oasis Cancún', false),
  ('Hacienda Corazon', false),
  ('Hacienda Jaguar', false),
  ('Hotel Catalonia Grand Costa Mujeres', false),
  ('Hotel Xcaret México', false),
  ('Hotel Yum Kaax', false),
  ('Kima Tulum', false),
  ('Quinta Real Yaxché Weddings & Events', false),
  ('Villa Alma', false),
  ('Villa Isla Blanca', false),
  ('Villa La Joya', false),
  ('Waldorf Astoria Riviera Maya', false)
on conflict (name) do update
set is_preferred_vendor = excluded.is_preferred_vendor;

alter table public.events
rename column preferred_partner_id to payment_partner_venue_id;

alter table public.events
add column venue_id uuid references public.venues(id) on delete restrict;

update public.events as event
set
  venue_id = venue.id,
  venue_name = venue.name,
  booking_type = 'preferred_vendor',
  payment_partner_venue_id = venue.id
from public.venues as venue
where lower(trim(event.venue_name)) = lower(trim(venue.name))
  and venue.is_preferred_vendor;

update public.events as event
set
  venue_id = venue.id,
  venue_name = venue.name
from public.venues as venue
where lower(trim(event.venue_name)) = lower(trim(venue.name))
  and not venue.is_preferred_vendor
  and event.booking_type = 'direct'
  and event.payment_partner_venue_id is null;

alter table public.events
rename constraint events_booking_partner_check
to events_booking_payment_partner_check;

alter index if exists public.events_preferred_partner_idx
rename to events_payment_partner_venue_idx;

create index if not exists events_venue_idx
on public.events(venue_id)
where venue_id is not null;

drop trigger if exists set_preferred_partners_updated_at on public.venues;

create trigger set_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

drop policy if exists "CRM users manage preferred partners" on public.venues;

create policy "CRM users manage venues"
on public.venues for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

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

  insert into public.clients (
    first_name, last_name, email, phone, company_name, street_address,
    city, state_province, postal_code, country, lead_source,
    instagram, facebook
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
    event_type, event_date, guest_count, venue_id, venue_name, notes,
    booking_status, booking_type, payment_partner_venue_id, source_lead_id
  )
  values (
    input->>'eventType', (input->>'eventDate')::date,
    (input->>'guestCount')::integer, selected_venue_id,
    selected_venue_name, coalesce(input->>'notes', ''),
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

revoke all on function public.create_client_event(jsonb, uuid) from public;
grant execute on function public.create_client_event(jsonb, uuid)
to authenticated, service_role;
