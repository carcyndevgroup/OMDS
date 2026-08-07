create table if not exists public.event_equipment_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  equipment_id uuid not null references public.equipment_catalog(id) on delete restrict,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, equipment_id)
);

create index if not exists event_equipment_assignments_event_idx
on public.event_equipment_assignments(event_id);

create index if not exists event_equipment_assignments_equipment_idx
on public.event_equipment_assignments(equipment_id);

drop trigger if exists set_event_equipment_assignments_updated_at
on public.event_equipment_assignments;

create trigger set_event_equipment_assignments_updated_at
before update on public.event_equipment_assignments
for each row execute function public.set_updated_at();

alter table public.event_equipment_assignments enable row level security;

grant select, insert, update, delete
on public.event_equipment_assignments to authenticated, service_role;

drop policy if exists "CRM users manage event equipment assignments"
on public.event_equipment_assignments;

create policy "CRM users manage event equipment assignments"
on public.event_equipment_assignments for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
