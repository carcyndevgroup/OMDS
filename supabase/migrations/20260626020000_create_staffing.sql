create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text not null default '',
  email text not null default '',
  phone text not null default '',
  is_driver boolean not null default false,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  staff_member_id uuid not null references public.staff_members(id) on delete restrict,
  position text not null check (
    position in (
      'driver_a', 'driver_b', 'operator_1', 'operator_2',
      'operator_3', 'operator_4', 'operator_5', 'operator_6', 'other'
    )
  ),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, position)
);

create index if not exists event_staff_assignments_event_idx
on public.event_staff_assignments(event_id);

create index if not exists event_staff_assignments_staff_idx
on public.event_staff_assignments(staff_member_id);

drop trigger if exists set_staff_members_updated_at on public.staff_members;
create trigger set_staff_members_updated_at
before update on public.staff_members
for each row execute function public.set_updated_at();

drop trigger if exists set_event_staff_assignments_updated_at
on public.event_staff_assignments;
create trigger set_event_staff_assignments_updated_at
before update on public.event_staff_assignments
for each row execute function public.set_updated_at();

alter table public.staff_members enable row level security;
alter table public.event_staff_assignments enable row level security;

grant select, insert, update, delete
on public.staff_members to authenticated, service_role;

grant select, insert, update, delete
on public.event_staff_assignments to authenticated, service_role;

drop policy if exists "CRM users manage staff members"
on public.staff_members;
create policy "CRM users manage staff members"
on public.staff_members for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage event staff assignments"
on public.event_staff_assignments;
create policy "CRM users manage event staff assignments"
on public.event_staff_assignments for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
