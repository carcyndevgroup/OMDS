create table if not exists public.questionnaire_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  title text not null,
  description text not null default '',
  booking_type text check (booking_type in ('direct', 'preferred_vendor')),
  event_type text check (event_type in ('wedding', 'social_event', 'corporate_event', 'convention', 'other')),
  definition jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists questionnaire_templates_one_default_idx
on public.questionnaire_templates(is_default)
where is_default;

create or replace function public.ensure_single_default_questionnaire_template()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_default then
    update public.questionnaire_templates
    set is_default = false
    where id <> new.id
      and is_default;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_single_default_questionnaire_template
on public.questionnaire_templates;

create trigger ensure_single_default_questionnaire_template
before insert or update of is_default on public.questionnaire_templates
for each row execute function public.ensure_single_default_questionnaire_template();

drop trigger if exists set_questionnaire_templates_updated_at
on public.questionnaire_templates;

create trigger set_questionnaire_templates_updated_at
before update on public.questionnaire_templates
for each row execute function public.set_updated_at();

alter table public.questionnaire_templates enable row level security;

grant select, insert, update, delete
on public.questionnaire_templates to authenticated, service_role;

drop policy if exists "CRM users manage questionnaire templates"
on public.questionnaire_templates;

create policy "CRM users manage questionnaire templates"
on public.questionnaire_templates for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
