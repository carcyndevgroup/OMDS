create table if not exists public.app_travel_settings (
  id boolean primary key default true check (id),
  hq_address text not null default '',
  fuel_consumption_l_per_100km numeric(8,2) not null default 11.5
    check (fuel_consumption_l_per_100km >= 0),
  fuel_price_mxn_per_liter numeric(8,2) not null default 25.5
    check (fuel_price_mxn_per_liter >= 0),
  base_fee_mxn_per_km numeric(8,2) not null default 20
    check (base_fee_mxn_per_km >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_travel_settings (
  id, hq_address, fuel_consumption_l_per_100km,
  fuel_price_mxn_per_liter, base_fee_mxn_per_km
)
values (
  true,
  'Jardines Del Sur II, Benito Juarez, Quintana Roo, 77534, Mexico',
  11.5,
  25.5,
  20
)
on conflict (id) do nothing;

drop trigger if exists set_app_travel_settings_updated_at
on public.app_travel_settings;

create trigger set_app_travel_settings_updated_at
before update on public.app_travel_settings
for each row execute function public.set_updated_at();

alter table public.app_travel_settings enable row level security;

grant select, insert, update
on public.app_travel_settings
to authenticated, service_role;

drop policy if exists "CRM users manage travel settings"
on public.app_travel_settings;

create policy "CRM users manage travel settings"
on public.app_travel_settings for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
