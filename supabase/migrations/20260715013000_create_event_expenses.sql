create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.expense_categories (name, sort_order)
values
  ('Travel / Fuel', 10),
  ('Supplies', 20),
  ('Rental', 30),
  ('Food / Per Diem', 40),
  ('Repairs / Maintenance', 50),
  ('Other', 90)
on conflict (name) do nothing;

create table if not exists public.event_expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  expense_category_id uuid references public.expense_categories(id) on delete set null,
  description text not null,
  vendor_name text not null default '',
  amount_mxn numeric(12,2) not null default 0 check (amount_mxn >= 0),
  status text not null default 'estimated' check (
    status in ('estimated', 'approved', 'paid', 'void')
  ),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_expenses_event_idx
on public.event_expenses(event_id);

drop trigger if exists set_expense_categories_updated_at
on public.expense_categories;

create trigger set_expense_categories_updated_at
before update on public.expense_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_event_expenses_updated_at
on public.event_expenses;

create trigger set_event_expenses_updated_at
before update on public.event_expenses
for each row execute function public.set_updated_at();

alter table public.expense_categories enable row level security;
alter table public.event_expenses enable row level security;

grant select, insert, update, delete
on public.expense_categories, public.event_expenses to authenticated, service_role;

drop policy if exists "CRM users manage expense categories"
on public.expense_categories;

create policy "CRM users manage expense categories"
on public.expense_categories for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage event expenses"
on public.event_expenses;

create policy "CRM users manage event expenses"
on public.event_expenses for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
