create table if not exists public.sat_fiscal_profiles (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  legal_name text not null default '',
  rfc text not null default '',
  tax_regime text not null default '612',
  constancia_file_url text not null default '',
  opinion_file_url text not null default '',
  opinion_expires_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sat_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  fiscal_profile_id uuid references public.sat_fiscal_profiles(id) on delete set null,
  nickname text not null,
  bank_name text not null default '',
  clabe text not null default '',
  account_number text not null default '',
  beneficiary_name text not null default '',
  currency text not null default 'mxn' check (currency in ('mxn', 'usd')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.venues
add column if not exists fiscal_legal_name text not null default '',
add column if not exists fiscal_rfc text not null default '',
add column if not exists fiscal_postal_code text not null default '',
add column if not exists fiscal_tax_regime text not null default '601',
add column if not exists fiscal_cfdi_use text not null default 'G03',
add column if not exists fiscal_payment_method text not null default 'PPD',
add column if not exists fiscal_payment_form text not null default '99',
add column if not exists fiscal_tax_object text not null default '02',
add column if not exists fiscal_default_profile_id uuid references public.sat_fiscal_profiles(id) on delete set null,
add column if not exists fiscal_default_bank_account_id uuid references public.sat_bank_accounts(id) on delete set null,
add column if not exists fiscal_supplier_number text not null default '',
add column if not exists fiscal_due_rule text not null default 'manual'
  check (fiscal_due_rule in ('manual', 'same_day', 'next_day', 'monthly_cutoff', 'monthly_same_month')),
add column if not exists fiscal_due_day integer check (fiscal_due_day is null or fiscal_due_day between 1 and 31),
add column if not exists fiscal_iva_rate numeric(7,4) not null default 16 check (fiscal_iva_rate >= 0),
add column if not exists fiscal_retains_iva boolean not null default false,
add column if not exists fiscal_iva_retention_rate numeric(7,4) not null default 10.6667 check (fiscal_iva_retention_rate >= 0),
add column if not exists fiscal_retains_isr boolean not null default false,
add column if not exists fiscal_isr_retention_rate numeric(7,4) not null default 10 check (fiscal_isr_retention_rate >= 0),
add column if not exists fiscal_notes text not null default '';

drop trigger if exists set_sat_fiscal_profiles_updated_at on public.sat_fiscal_profiles;
create trigger set_sat_fiscal_profiles_updated_at
before update on public.sat_fiscal_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_sat_bank_accounts_updated_at on public.sat_bank_accounts;
create trigger set_sat_bank_accounts_updated_at
before update on public.sat_bank_accounts
for each row execute function public.set_updated_at();

alter table public.sat_fiscal_profiles enable row level security;
alter table public.sat_bank_accounts enable row level security;

grant select, insert, update, delete
on public.sat_fiscal_profiles, public.sat_bank_accounts
to authenticated, service_role;

drop policy if exists "CRM users manage SAT fiscal profiles" on public.sat_fiscal_profiles;
create policy "CRM users manage SAT fiscal profiles"
on public.sat_fiscal_profiles for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage SAT bank accounts" on public.sat_bank_accounts;
create policy "CRM users manage SAT bank accounts"
on public.sat_bank_accounts for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
