create table if not exists public.contract_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.contract_templates(id) on delete cascade,
  version_number integer not null,
  template_key text not null,
  title text not null,
  description text not null default '',
  booking_type text check (booking_type in ('direct', 'preferred_vendor')),
  event_type text check (event_type in ('wedding', 'social_event', 'corporate_event', 'convention', 'other')),
  body text not null default '',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(template_id, version_number)
);

create index if not exists contract_template_versions_template_id_created_at_idx
on public.contract_template_versions(template_id, created_at desc);

alter table public.contract_template_versions enable row level security;

grant select, insert, update, delete
on public.contract_template_versions to authenticated, service_role;

drop policy if exists "CRM users manage contract template versions"
on public.contract_template_versions;

create policy "CRM users manage contract template versions"
on public.contract_template_versions for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

create table if not exists public.email_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.email_templates(id) on delete cascade,
  version_number integer not null,
  template_key text not null,
  title text not null,
  description text not null default '',
  document_kind text not null check (document_kind in ('questionnaire', 'contract', 'invoice', 'quote', 'general')),
  subject text not null default '',
  body text not null default '',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(template_id, version_number)
);

create index if not exists email_template_versions_template_id_created_at_idx
on public.email_template_versions(template_id, created_at desc);

alter table public.email_template_versions enable row level security;

grant select, insert, update, delete
on public.email_template_versions to authenticated, service_role;

drop policy if exists "CRM users manage email template versions"
on public.email_template_versions;

create policy "CRM users manage email template versions"
on public.email_template_versions for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
