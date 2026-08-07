create table if not exists public.preferred_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.preferred_partners (name)
values
  ('Breathless Cancún Soul Resort & Spa'),
  ('Dreams Jade Resort & Spa'),
  ('Dreams Playa Mujeres Golf & Spa Resort'),
  ('El Dorado Royale'),
  ('El Dorado Seaside Suite'),
  ('Generations Riviera Maya Resort'),
  ('Grand Palladium Select Costa Mujeres'),
  ('Iberostar Selection Cancún'),
  ('Kempinski Hotel Cancún'),
  ('Live Aqua Cancún'),
  ('Paradisus Playa del Carmen - Riviera Maya'),
  ('Secrets Playa Mujeres Golf & Spa Resort'),
  ('The Riviera Maya EDITION at Kanai')
on conflict (name) do nothing;

alter table public.events
add column if not exists booking_type text not null default 'direct'
check (booking_type in ('direct', 'preferred_vendor'));

alter table public.events
add column if not exists preferred_partner_id uuid
references public.preferred_partners(id) on delete restrict;

update public.events as event
set booking_type = client.client_type
from public.event_contacts as contact
join public.clients as client on client.id = contact.client_id
where contact.event_id = event.id
  and contact.is_primary;

alter table public.events
drop constraint if exists events_booking_partner_check;

alter table public.events
add constraint events_booking_partner_check
check (
  (booking_type = 'direct' and preferred_partner_id is null)
  or
  (booking_type = 'preferred_vendor' and preferred_partner_id is not null)
) not valid;

alter table public.clients drop column if exists client_type;

create index if not exists events_preferred_partner_idx
on public.events(preferred_partner_id)
where preferred_partner_id is not null;

drop trigger if exists set_preferred_partners_updated_at
on public.preferred_partners;

create trigger set_preferred_partners_updated_at
before update on public.preferred_partners
for each row execute function public.set_updated_at();

alter table public.preferred_partners enable row level security;

grant select, insert, update, delete
on public.preferred_partners to authenticated, service_role;

drop policy if exists "CRM users manage preferred partners"
on public.preferred_partners;

create policy "CRM users manage preferred partners"
on public.preferred_partners for all to authenticated
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
  selected_partner_id uuid := nullif(input->>'preferredPartnerId', '')::uuid;
begin
  if selected_booking_type = 'preferred_vendor'
    and selected_partner_id is null then
    raise exception 'preferred_partner_required';
  end if;

  if selected_booking_type = 'direct' then
    selected_partner_id := null;
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
    event_type, event_date, guest_count, venue_name, notes,
    booking_status, booking_type, preferred_partner_id, source_lead_id
  )
  values (
    input->>'eventType', (input->>'eventDate')::date,
    (input->>'guestCount')::integer, coalesce(input->>'venueName', ''),
    coalesce(input->>'notes', ''),
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

    if not found then
      raise exception 'lead_not_found';
    end if;
  end if;

  return query select new_client_id, new_event_id;
end;
$$;

revoke all on function public.create_client_event(jsonb, uuid) from public;
grant execute on function public.create_client_event(jsonb, uuid)
to authenticated, service_role;
