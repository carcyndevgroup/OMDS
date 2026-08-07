create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  company_name text not null default '',
  street_address text not null default '',
  city text not null default '',
  state_province text not null default '',
  postal_code text not null default '',
  country text not null default '',
  client_type text not null check (
    client_type in ('direct', 'preferred_vendor')
  ),
  lead_source text not null check (
    lead_source in (
      'website', 'facebook', 'facebook_group', 'instagram', 'tiktok',
      'external_planner', 'hotel_venue', 'hotel_venue_pv',
      'vendor_referral', 'client_referral', 'other'
    )
  ),
  instagram text not null default '',
  facebook text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'wedding', 'social_event', 'corporate_event', 'convention', 'other'
    )
  ),
  event_date date not null,
  guest_count integer not null check (guest_count > 0),
  venue_name text not null default '',
  notes text not null default '',
  booking_status text not null default 'quote_requested' check (
    booking_status in (
      'quote_requested', 'proposal_sent', 'tentative_hold',
      'confirmed', 'cancelled', 'lost'
    )
  ),
  source_lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_contacts (
  event_id uuid not null references public.events(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  role text not null check (
    role in (
      'bride', 'groom', 'parent_family', 'external_planner',
      'hotel_resort', 'private_venue', 'other'
    )
  ),
  is_primary boolean not null default false,
  primary key (event_id, client_id)
);

create table if not exists public.event_services (
  event_id uuid not null references public.events(id) on delete cascade,
  service_id text not null,
  primary key (event_id, service_id)
);

create unique index if not exists events_source_lead_idx
  on public.events(source_lead_id)
  where source_lead_id is not null;

create unique index if not exists event_primary_contact_idx
  on public.event_contacts(event_id)
  where is_primary;

create index if not exists events_booking_status_idx
  on public.events(booking_status);

create index if not exists events_event_date_idx
  on public.events(event_date);

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.events enable row level security;
alter table public.event_contacts enable row level security;
alter table public.event_services enable row level security;

grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.event_contacts to authenticated;
grant select, insert, update, delete on public.event_services to authenticated;

grant select, insert, update, delete on public.clients to service_role;
grant select, insert, update, delete on public.events to service_role;
grant select, insert, update, delete on public.event_contacts to service_role;
grant select, insert, update, delete on public.event_services to service_role;

drop policy if exists "CRM users manage clients" on public.clients;
create policy "CRM users manage clients"
on public.clients for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage events" on public.events;
create policy "CRM users manage events"
on public.events for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage event contacts" on public.event_contacts;
create policy "CRM users manage event contacts"
on public.event_contacts for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage event services" on public.event_services;
create policy "CRM users manage event services"
on public.event_services for all to authenticated
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
begin
  insert into public.clients (
    first_name, last_name, email, phone, company_name, street_address,
    city, state_province, postal_code, country, client_type, lead_source,
    instagram, facebook
  )
  values (
    input->>'firstName',
    input->>'lastName',
    input->>'email',
    input->>'phone',
    coalesce(input->>'companyName', ''),
    coalesce(input->>'streetAddress', ''),
    coalesce(input->>'city', ''),
    coalesce(input->>'stateProvince', ''),
    coalesce(input->>'postalCode', ''),
    coalesce(input->>'country', ''),
    input->>'clientType',
    input->>'leadSource',
    coalesce(input->>'instagram', ''),
    coalesce(input->>'facebook', '')
  )
  returning id into new_client_id;

  insert into public.events (
    event_type, event_date, guest_count, venue_name, notes,
    booking_status, source_lead_id
  )
  values (
    input->>'eventType',
    (input->>'eventDate')::date,
    (input->>'guestCount')::integer,
    coalesce(input->>'venueName', ''),
    coalesce(input->>'notes', ''),
    coalesce(input->>'bookingStatus', 'quote_requested'),
    source_lead_id
  )
  returning id into new_event_id;

  insert into public.event_contacts (
    event_id, client_id, role, is_primary
  )
  values (
    new_event_id, new_client_id, input->>'role', true
  );

  insert into public.event_services (event_id, service_id)
  select new_event_id, value
  from jsonb_array_elements_text(
    coalesce(input->'serviceIds', '[]'::jsonb)
  );

  if source_lead_id is not null then
    update public.leads
    set status = 'converted'
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
