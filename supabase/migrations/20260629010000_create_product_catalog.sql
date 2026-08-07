create table if not exists public.product_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('dessert', 'snack')),
  family text not null default '',
  description text not null default '',
  cog_mxn numeric(12,2) not null default 0 check (cog_mxn >= 0),
  price_mxn numeric(12,2) not null default 0 check (price_mxn >= 0),
  is_taxable boolean not null default true,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.product_catalog (name, category, family)
values
  ('Churros with Cinnamon Sugar', 'dessert', 'Churros'),
  ('Churros with Topping Bar', 'dessert', 'Churros'),
  ('Churros Filled with Topping Bar', 'dessert', 'Churros'),
  ('Churros with Topping Bar & Gelato', 'dessert', 'Churros'),
  ('Gelato with Topping Bar', 'dessert', 'Gelato, Sorbets and Rolled Ice Cream'),
  ('Sorbet with Topping Bar', 'dessert', 'Gelato, Sorbets and Rolled Ice Cream'),
  ('Rolled Ice Cream - Signature Rollz', 'dessert', 'Gelato, Sorbets and Rolled Ice Cream'),
  ('Rolled Ice Cream - Traditional Flavors + Fresh Fruits', 'dessert', 'Gelato, Sorbets and Rolled Ice Cream'),
  ('1 Server with Box Only', 'dessert', 'Cannolis'),
  ('1 Server with Box + Booth with 1 Server', 'dessert', 'Cannolis'),
  ('1 Booth with Server (No Box)', 'dessert', 'Cannolis'),
  ('Chocolate Fountains', 'dessert', 'Chocolate Fountains'),
  ('Conchas', 'dessert', 'Conchas'),
  ('Donuts with Topping Bar', 'dessert', 'Donuts'),
  ('Donuts with Topping Bar & Gelato', 'dessert', 'Donuts'),
  ('Pancakes with Topping Bar', 'dessert', 'Pancakes'),
  ('Pancakes with Topping Bar + Fresh Fruit', 'dessert', 'Pancakes'),
  ('Pancakes with Topping Bar & Gelato', 'dessert', 'Pancakes'),
  ('Waffles with Topping Bar', 'dessert', 'Waffles'),
  ('Waffles with Topping Bar + Fresh Fruit', 'dessert', 'Waffles'),
  ('Waffles with Topping Bar & Gelato', 'dessert', 'Waffles'),
  ('S''mores with Topping Bar', 'dessert', 'S''mores'),
  ('Cookies with Topping Bar', 'dessert', 'Cookies'),
  ('Cookies with Topping Bar & Gelato', 'dessert', 'Cookies'),
  ('Popcorn Bar', 'snack', 'Popcorn Bar'),
  ('Mexican Street Corn Bar (Esquites)', 'snack', 'Mexican Street Corn Bar'),
  ('Ramen Bar', 'snack', 'Ramen Bar')
on conflict (name) do nothing;

create index if not exists product_catalog_category_idx
on public.product_catalog(category, family);

drop trigger if exists set_product_catalog_updated_at
on public.product_catalog;

create trigger set_product_catalog_updated_at
before update on public.product_catalog
for each row execute function public.set_updated_at();

alter table public.product_catalog enable row level security;

grant select, insert, update, delete
on public.product_catalog to authenticated, service_role;

drop policy if exists "CRM users manage product catalog"
on public.product_catalog;

create policy "CRM users manage product catalog"
on public.product_catalog for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
