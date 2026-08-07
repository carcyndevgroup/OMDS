create table if not exists public.payroll_task_catalog (
  id uuid primary key default gen_random_uuid(),
  task_key text not null unique,
  category text not null check (category in ('driver', 'operator', 'warehouse', 'kitchen')),
  name text not null,
  pay_rule text not null default 'fixed' check (
    pay_rule in ('fixed', 'operator_hours', 'driver_direction', 'churro_dough')
  ),
  base_amount_mxn numeric(12,2) not null default 0 check (base_amount_mxn >= 0),
  overtime_rate_mxn numeric(12,2) not null default 0 check (overtime_rate_mxn >= 0),
  included_quantity numeric(10,2) not null default 1 check (included_quantity >= 0),
  additional_unit_amount_mxn numeric(12,2) not null default 0 check (additional_unit_amount_mxn >= 0),
  unit_label text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.payroll_task_catalog
  (task_key, category, name, pay_rule, base_amount_mxn, overtime_rate_mxn, included_quantity, additional_unit_amount_mxn, unit_label, sort_order)
values
  ('driver_a_direction', 'driver', 'Driver A Direction', 'driver_direction', 125, 0, 1, 0, 'direction', 10),
  ('driver_b_direction', 'driver', 'Driver B Direction', 'driver_direction', 125, 0, 1, 0, 'direction', 20),
  ('operator_1', 'operator', 'Operator 1 (Lead)', 'operator_hours', 600, 50, 6, 0, 'hour', 110),
  ('operator_2', 'operator', 'Operator 2', 'operator_hours', 600, 50, 6, 0, 'hour', 120),
  ('operator_3', 'operator', 'Operator 3', 'operator_hours', 600, 50, 6, 0, 'hour', 130),
  ('operator_4', 'operator', 'Operator 4', 'operator_hours', 600, 50, 6, 0, 'hour', 140),
  ('operator_5', 'operator', 'Operator 5', 'operator_hours', 600, 50, 6, 0, 'hour', 150),
  ('operator_6', 'operator', 'Operator 6', 'operator_hours', 600, 50, 6, 0, 'hour', 160),
  ('box_prep', 'warehouse', 'Box Prep', 'fixed', 200, 0, 1, 0, '', 210),
  ('cleaning_churros', 'warehouse', 'Cleaning - Churros', 'fixed', 200, 0, 1, 0, '', 220),
  ('cleaning_other', 'warehouse', 'Cleaning - Other', 'fixed', 200, 0, 1, 0, '', 230),
  ('cart_washing', 'warehouse', 'Cart Washing', 'fixed', 250, 0, 1, 0, '', 240),
  ('booth_maintenance', 'warehouse', 'Booth Maintenance', 'fixed', 250, 0, 1, 0, '', 250),
  ('churro_dough', 'kitchen', 'Churro Dough', 'churro_dough', 500, 0, 2, 100, 'kg', 310),
  ('pancake_mix_toppings', 'kitchen', 'Pancake Mix/Toppings', 'fixed', 200, 0, 1, 0, '', 320),
  ('waffle_mix_toppings', 'kitchen', 'Waffle Mix/Toppings', 'fixed', 200, 0, 1, 0, '', 330),
  ('rollz_mix_toppings', 'kitchen', 'Rollz Mix/Toppings', 'fixed', 200, 0, 1, 0, '', 340),
  ('donut_mix_toppings', 'kitchen', 'Donut Mix/Toppings', 'fixed', 200, 0, 1, 0, '', 350),
  ('crepe_mix_toppings', 'kitchen', 'Crepe Mix/Toppings', 'fixed', 200, 0, 1, 0, '', 360),
  ('fountain_prep', 'kitchen', 'Fountain Prep', 'fixed', 150, 0, 1, 0, '', 370),
  ('smores_prep', 'kitchen', 'S''mores Prep', 'fixed', 150, 0, 1, 0, '', 380),
  ('conchas_prep', 'kitchen', 'Conchas Prep', 'fixed', 150, 0, 1, 0, '', 390),
  ('cannoli_prep', 'kitchen', 'Cannoli Prep', 'fixed', 150, 0, 1, 0, '', 400),
  ('popcorn_prep', 'kitchen', 'Popcorn Prep', 'fixed', 150, 0, 1, 0, '', 410),
  ('esquites_prep', 'kitchen', 'Esquites Prep', 'fixed', 200, 0, 1, 0, '', 420),
  ('ramen_prep', 'kitchen', 'Ramen Prep', 'fixed', 200, 0, 1, 0, '', 430)
on conflict (task_key) do update set
  category = excluded.category,
  name = excluded.name,
  pay_rule = excluded.pay_rule,
  base_amount_mxn = excluded.base_amount_mxn,
  overtime_rate_mxn = excluded.overtime_rate_mxn,
  included_quantity = excluded.included_quantity,
  additional_unit_amount_mxn = excluded.additional_unit_amount_mxn,
  unit_label = excluded.unit_label,
  sort_order = excluded.sort_order;

drop trigger if exists set_payroll_task_catalog_updated_at
on public.payroll_task_catalog;

create trigger set_payroll_task_catalog_updated_at
before update on public.payroll_task_catalog
for each row execute function public.set_updated_at();

alter table public.payroll_task_catalog enable row level security;

grant select, insert, update, delete
on public.payroll_task_catalog to authenticated, service_role;

drop policy if exists "CRM users manage payroll task catalog"
on public.payroll_task_catalog;

create policy "CRM users manage payroll task catalog"
on public.payroll_task_catalog for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
