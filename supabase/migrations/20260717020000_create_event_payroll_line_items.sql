create table if not exists public.event_payroll_line_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  staff_member_id uuid not null references public.staff_members(id) on delete restrict,
  payroll_task_id uuid references public.payroll_task_catalog(id) on delete set null,
  event_staff_assignment_id uuid references public.event_staff_assignments(id) on delete set null,
  task_name text not null,
  task_category text not null default '',
  pay_rule text not null default 'fixed',
  quantity numeric(10,2) not null default 1 check (quantity >= 0),
  rate_mxn numeric(12,2) not null default 0 check (rate_mxn >= 0),
  overtime_rate_mxn numeric(12,2) not null default 0 check (overtime_rate_mxn >= 0),
  included_quantity numeric(10,2) not null default 1 check (included_quantity >= 0),
  additional_unit_amount_mxn numeric(12,2) not null default 0 check (additional_unit_amount_mxn >= 0),
  calculated_amount_mxn numeric(12,2) not null default 0 check (calculated_amount_mxn >= 0),
  manual_adjustment_mxn numeric(12,2) not null default 0,
  tips_bonus_mxn numeric(12,2) not null default 0 check (tips_bonus_mxn >= 0),
  total_mxn numeric(12,2) not null default 0 check (total_mxn >= 0),
  status text not null default 'estimated' check (
    status in ('estimated', 'approved', 'scheduled', 'paid', 'waived')
  ),
  scheduled_pay_date date,
  paid_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_payroll_line_items_event_idx
on public.event_payroll_line_items(event_id);

create index if not exists event_payroll_line_items_staff_idx
on public.event_payroll_line_items(staff_member_id);

drop trigger if exists set_event_payroll_line_items_updated_at
on public.event_payroll_line_items;

create trigger set_event_payroll_line_items_updated_at
before update on public.event_payroll_line_items
for each row execute function public.set_updated_at();

alter table public.event_payroll_line_items enable row level security;

grant select, insert, update, delete
on public.event_payroll_line_items to authenticated, service_role;

drop policy if exists "CRM users manage event payroll line items"
on public.event_payroll_line_items;

create policy "CRM users manage event payroll line items"
on public.event_payroll_line_items for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

create or replace function public.calculate_event_payroll_amount(
  pay_rule text,
  quantity numeric,
  rate_mxn numeric,
  overtime_rate_mxn numeric,
  included_quantity numeric,
  additional_unit_amount_mxn numeric
)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when pay_rule = 'operator_hours' then
      rate_mxn + greatest(ceil(greatest(quantity - included_quantity, 0) * 4) / 4, 0) * overtime_rate_mxn
    when pay_rule = 'churro_dough' then
      rate_mxn + greatest(quantity - included_quantity, 0) * additional_unit_amount_mxn
    else
      quantity * rate_mxn
  end;
$$;

create or replace function public.set_event_payroll_line_item_totals()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.calculated_amount_mxn := public.calculate_event_payroll_amount(
    new.pay_rule,
    new.quantity,
    new.rate_mxn,
    new.overtime_rate_mxn,
    new.included_quantity,
    new.additional_unit_amount_mxn
  );
  new.total_mxn := greatest(
    new.calculated_amount_mxn + new.manual_adjustment_mxn + new.tips_bonus_mxn,
    0
  );
  return new;
end;
$$;

drop trigger if exists set_event_payroll_line_item_totals
on public.event_payroll_line_items;

create trigger set_event_payroll_line_item_totals
before insert or update on public.event_payroll_line_items
for each row execute function public.set_event_payroll_line_item_totals();
