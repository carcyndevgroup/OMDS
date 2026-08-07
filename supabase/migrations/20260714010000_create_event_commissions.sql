create table if not exists public.event_commissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  commission_type text not null check (
    commission_type in ('venue_hotel', 'planner', 'other')
  ),
  payee_name text not null default '',
  related_venue_id uuid references public.venues(id) on delete set null,
  related_planner_id uuid references public.planners(id) on delete set null,
  calculation_model text not null default 'fixed_percentage' check (
    calculation_model in ('fixed_percentage', 'fixed_amount', 'manual')
  ),
  percentage numeric(7,4),
  base_amount_mxn numeric(12,2) not null default 0 check (base_amount_mxn >= 0),
  amount_mxn numeric(12,2) not null default 0 check (amount_mxn >= 0),
  status text not null default 'estimated' check (
    status in ('estimated', 'approved', 'paid', 'waived')
  ),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_commissions_percentage_check check (
    calculation_model <> 'fixed_percentage'
    or percentage is not null
  )
);

create index if not exists event_commissions_event_idx
on public.event_commissions(event_id);

create index if not exists event_commissions_planner_idx
on public.event_commissions(related_planner_id)
where related_planner_id is not null;

create index if not exists event_commissions_venue_idx
on public.event_commissions(related_venue_id)
where related_venue_id is not null;

drop trigger if exists set_event_commissions_updated_at
on public.event_commissions;

create trigger set_event_commissions_updated_at
before update on public.event_commissions
for each row execute function public.set_updated_at();

alter table public.event_commissions enable row level security;

grant select, insert, update, delete
on public.event_commissions to authenticated, service_role;

drop policy if exists "CRM users manage event commissions"
on public.event_commissions;

create policy "CRM users manage event commissions"
on public.event_commissions for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
