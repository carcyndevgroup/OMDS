create table if not exists public.event_staff_payroll (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_staff_assignment_id uuid not null
    references public.event_staff_assignments(id) on delete cascade,
  amount_mxn numeric(12,2) not null default 0 check (amount_mxn >= 0),
  status text not null default 'estimated' check (
    status in ('estimated', 'approved', 'paid', 'waived')
  ),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, event_staff_assignment_id)
);

create index if not exists event_staff_payroll_event_idx
on public.event_staff_payroll(event_id);

drop trigger if exists set_event_staff_payroll_updated_at
on public.event_staff_payroll;

create trigger set_event_staff_payroll_updated_at
before update on public.event_staff_payroll
for each row execute function public.set_updated_at();

alter table public.event_staff_payroll enable row level security;

grant select, insert, update, delete
on public.event_staff_payroll to authenticated, service_role;

drop policy if exists "CRM users manage event staff payroll"
on public.event_staff_payroll;

create policy "CRM users manage event staff payroll"
on public.event_staff_payroll for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
