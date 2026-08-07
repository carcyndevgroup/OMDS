create table if not exists public.venue_contacts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  role text not null check (
    role in (
      'wedding_events_coordinator', 'sales_manager', 'banquets_operations',
      'accounting_facturacion', 'general_contact', 'other'
    )
  ),
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  preferred_contact_method text not null default 'email' check (
    preferred_contact_method in ('email', 'phone', 'whatsapp', 'none')
  ),
  notes text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venue_contacts_venue_idx
on public.venue_contacts(venue_id);

drop trigger if exists set_venue_contacts_updated_at
on public.venue_contacts;

create trigger set_venue_contacts_updated_at
before update on public.venue_contacts
for each row execute function public.set_updated_at();

alter table public.venue_contacts enable row level security;

grant select, insert, update, delete
on public.venue_contacts to authenticated, service_role;

drop policy if exists "CRM users manage venue contacts"
on public.venue_contacts;

create policy "CRM users manage venue contacts"
on public.venue_contacts for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
