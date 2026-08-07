create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  role text not null check (
    role in (
      'bride', 'groom', 'parent_family', 'external_planner',
      'hotel_resort', 'private_venue', 'other'
    )
  ),
  event_type text not null check (
    event_type in (
      'wedding', 'social_event', 'corporate_event', 'convention', 'other'
    )
  ),
  event_date date not null,
  guest_count integer not null check (guest_count > 0),
  venue_name text not null default '',
  notes text not null default '',
  lead_source text not null check (
    lead_source in (
      'website', 'facebook', 'facebook_group', 'instagram', 'tiktok',
      'external_planner', 'hotel_venue', 'hotel_venue_pv',
      'vendor_referral', 'client_referral', 'other'
    )
  ),
  status text not null default 'new' check (
    status in (
      'new', 'contacted', 'waiting_on_lead', 'converted',
      'event_complete', 'closed', 'lost', 'spam'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_services (
  lead_id uuid not null references public.leads(id) on delete cascade,
  service_id text not null,
  primary key (lead_id, service_id)
);

create index if not exists leads_event_date_idx
  on public.leads(event_date);

create index if not exists leads_status_idx
  on public.leads(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;

create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_services enable row level security;

revoke all on public.leads from anon, authenticated;
revoke all on public.lead_services from anon, authenticated;
