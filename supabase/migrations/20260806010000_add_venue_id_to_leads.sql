alter table public.leads
  add column if not exists venue_id uuid references public.venues(id) on delete set null;

create index if not exists leads_venue_id_idx
  on public.leads(venue_id);