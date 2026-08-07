alter table public.clients
add column if not exists legal_first_name text not null default '',
add column if not exists legal_last_name text not null default '',
add column if not exists preferred_communication_method text not null default 'email'
check (preferred_communication_method in ('email', 'whatsapp', 'phone'));

alter table public.events
add column if not exists event_name text not null default '',
add column if not exists marquee_sign_names text not null default '',
add column if not exists event_hashtags text not null default '',
add column if not exists service_end_time time,
add column if not exists service_location_description text not null default '',
add column if not exists power_supply_access text not null default 'not_sure'
check (power_supply_access in ('yes', 'no', 'not_sure')),
add column if not exists power_supply_notes text not null default '',
add column if not exists special_requests text not null default '',
add column if not exists client_operational_notes text not null default '';

create table if not exists public.event_venue_contacts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  source_venue_contact_id uuid references public.venue_contacts(id) on delete set null,
  name text not null,
  role text not null default '',
  email text not null default '',
  phone text not null default '',
  notes text not null default '',
  should_save_to_venue_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_venue_contacts_event_idx
on public.event_venue_contacts(event_id);

alter table public.events
add column if not exists assigned_event_venue_contact_id uuid
references public.event_venue_contacts(id) on delete set null;

create index if not exists events_assigned_event_venue_contact_idx
on public.events(assigned_event_venue_contact_id)
where assigned_event_venue_contact_id is not null;

alter table public.questionnaires
add column if not exists review_status text not null default 'not_started'
check (review_status in ('not_started', 'pending_review', 'approved', 'rejected')),
add column if not exists review_notes text not null default '',
add column if not exists reviewed_at timestamptz;

alter table public.event_planners
drop constraint if exists event_planners_role_check;

alter table public.event_planners
add constraint event_planners_role_check
check (
  role in (
    'primary_planner', 'referral_planner', 'coordinator',
    'day_of_coordinator', 'other'
  )
);

drop trigger if exists set_event_venue_contacts_updated_at
on public.event_venue_contacts;

create trigger set_event_venue_contacts_updated_at
before update on public.event_venue_contacts
for each row execute function public.set_updated_at();

alter table public.event_venue_contacts enable row level security;

grant select, insert, update, delete
on public.event_venue_contacts to authenticated, service_role;

drop policy if exists "CRM users manage event venue contacts"
on public.event_venue_contacts;

create policy "CRM users manage event venue contacts"
on public.event_venue_contacts for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
