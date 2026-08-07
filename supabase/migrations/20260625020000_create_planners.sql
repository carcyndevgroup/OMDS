create table if not exists public.planners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text not null default '',
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  instagram text not null default '',
  website_url text not null default '',
  area text not null default '',
  city text not null default '',
  preferred_contact_method text not null default 'email'
    check (preferred_contact_method in ('email', 'phone', 'whatsapp', 'instagram', 'none')),
  default_commission_model text not null default 'fixed_percentage'
    check (default_commission_model in ('none', 'fixed_percentage', 'fixed_amount', 'case_by_case', 'notes_only')),
  default_commission_percentage numeric,
  pv_commission_policy text not null default 'reduced_commission'
    check (pv_commission_policy in ('no_commission', 'reduced_commission', 'case_by_case', 'full_commission_allowed')),
  internal_status text not null default 'active'
    check (internal_status in ('active', 'inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists planners_name_idx on public.planners(name);
create index if not exists planners_status_idx on public.planners(internal_status);

drop trigger if exists set_planners_updated_at on public.planners;

create trigger set_planners_updated_at
before update on public.planners
for each row execute function public.set_updated_at();

alter table public.planners enable row level security;

grant select, insert, update, delete
on public.planners to authenticated, service_role;

drop policy if exists "CRM users manage planners" on public.planners;

create policy "CRM users manage planners"
on public.planners for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
