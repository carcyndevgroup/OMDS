create table if not exists public.app_company_profile_settings (
  id boolean primary key default true,
  legal_name text not null default '',
  dba_name text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_company_profile_settings (id, legal_name, dba_name, address, phone, email, website)
values (true, '', '', '', '', '', '')
on conflict (id) do nothing;

drop trigger if exists set_app_company_profile_settings_updated_at
on public.app_company_profile_settings;

create trigger set_app_company_profile_settings_updated_at
before update on public.app_company_profile_settings
for each row execute function public.set_updated_at();

alter table public.app_company_profile_settings enable row level security;

grant select, insert, update, delete
on public.app_company_profile_settings to authenticated, service_role;

drop policy if exists "CRM users manage company profile settings"
on public.app_company_profile_settings;

create policy "CRM users manage company profile settings"
on public.app_company_profile_settings for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
