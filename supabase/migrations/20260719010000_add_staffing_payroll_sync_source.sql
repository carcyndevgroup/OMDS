alter table public.event_payroll_line_items
add column if not exists source text not null default 'manual';

alter table public.event_payroll_line_items
drop constraint if exists event_payroll_line_items_source_check;

alter table public.event_payroll_line_items
add constraint event_payroll_line_items_source_check
check (source in ('manual', 'auto_staffing'));

create unique index if not exists event_payroll_auto_staffing_assignment_idx
on public.event_payroll_line_items(event_staff_assignment_id)
where source = 'auto_staffing'
  and event_staff_assignment_id is not null;
