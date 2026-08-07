create table if not exists public.equipment_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.equipment_catalog (name, category)
values
  ('Churro Cart 1', 'churro_cart'),
  ('Churro Cart 2', 'churro_cart'),
  ('Booth 1', 'booth'),
  ('Booth 2', 'booth'),
  ('Booth Top 1', 'booth_top'),
  ('Booth Top 2', 'booth_top'),
  ('Booth Top 3', 'booth_top'),
  ('Booth Top 4', 'booth_top'),
  ('Cannoli Box 1', 'cannoli_box'),
  ('Cannoli Box 2', 'cannoli_box'),
  ('Freezer 1', 'freezer'),
  ('Freezer 2', 'freezer'),
  ('Rollz 1', 'rollz'),
  ('Pancake 1', 'pancake'),
  ('Pancake 2', 'pancake'),
  ('Waffle 1', 'waffle'),
  ('Waffle 2', 'waffle'),
  ('Fountain 1', 'fountain'),
  ('Fountain 2', 'fountain'),
  ('Toaster Oven 1', 'toaster_oven'),
  ('Toaster Oven 2', 'toaster_oven'),
  ('Food Warmer 1', 'food_warmer'),
  ('Food Warmer 2', 'food_warmer'),
  ('Food Warmer 3', 'food_warmer'),
  ('Food Warmer 4', 'food_warmer'),
  ('S''mores Bar 1', 'smores_bar'),
  ('S''mores Bar 2', 'smores_bar'),
  ('Popcorn 1', 'popcorn'),
  ('Popcorn 2', 'popcorn'),
  ('Slowcooker 1', 'slowcooker'),
  ('Slowcooker 2', 'slowcooker'),
  ('Slowcooker 3', 'slowcooker'),
  ('Slowcooker 4', 'slowcooker'),
  ('Slowcooker 5', 'slowcooker'),
  ('Slowcooker 6', 'slowcooker')
on conflict (name) do nothing;

create index if not exists equipment_catalog_category_idx
on public.equipment_catalog(category);

drop trigger if exists set_equipment_catalog_updated_at
on public.equipment_catalog;

create trigger set_equipment_catalog_updated_at
before update on public.equipment_catalog
for each row execute function public.set_updated_at();

alter table public.equipment_catalog enable row level security;

grant select, insert, update, delete
on public.equipment_catalog to authenticated, service_role;

drop policy if exists "CRM users manage equipment catalog"
on public.equipment_catalog;

create policy "CRM users manage equipment catalog"
on public.equipment_catalog for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
