create table if not exists public.event_planners (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  planner_id uuid not null references public.planners(id) on delete restrict,
  role text not null default 'primary_planner'
    check (role in ('primary_planner', 'referral_planner', 'coordinator', 'other')),
  is_primary boolean not null default true,
  commission_eligible boolean not null default true,
  commission_percentage_override numeric,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, planner_id)
);

create index if not exists event_planners_event_idx on public.event_planners(event_id);
create index if not exists event_planners_planner_idx on public.event_planners(planner_id);

drop trigger if exists set_event_planners_updated_at on public.event_planners;

create trigger set_event_planners_updated_at
before update on public.event_planners
for each row execute function public.set_updated_at();

alter table public.event_planners enable row level security;

grant select, insert, update, delete
on public.event_planners to authenticated, service_role;

drop policy if exists "CRM users manage event planners" on public.event_planners;

create policy "CRM users manage event planners"
on public.event_planners for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
