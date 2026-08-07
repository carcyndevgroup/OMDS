create table if not exists public.questionnaire_field_catalog (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  target_table text not null,
  target_column text not null,
  question_type text not null check (
    question_type in ('text', 'textarea', 'email', 'phone', 'select', 'date', 'time', 'number', 'repeatable')
  ),
  label_en text not null,
  label_es text not null,
  helper_en text not null default '',
  helper_es text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questionnaire_field_catalog_sort_idx
  on public.questionnaire_field_catalog(sort_order, label_en);

drop trigger if exists set_questionnaire_field_catalog_updated_at
  on public.questionnaire_field_catalog;

create trigger set_questionnaire_field_catalog_updated_at
before update on public.questionnaire_field_catalog
for each row execute function public.set_updated_at();

alter table public.questionnaire_field_catalog enable row level security;

grant select, insert, update, delete
on public.questionnaire_field_catalog to authenticated, service_role;

drop policy if exists "CRM users manage questionnaire field catalog"
on public.questionnaire_field_catalog;

create policy "CRM users manage questionnaire field catalog"
on public.questionnaire_field_catalog for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
