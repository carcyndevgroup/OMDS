create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  template_key text not null default 'new_booking',
  title text not null default 'New Booking Questionnaire',
  locale text not null default 'en' check (locale in ('en', 'es')),
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'submitted')
  ),
  response_data jsonb not null default '{}'::jsonb,
  internal_change_notes text not null default '',
  sent_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, template_key)
);

create index if not exists questionnaires_event_idx
on public.questionnaires(event_id);

drop trigger if exists set_questionnaires_updated_at on public.questionnaires;

create trigger set_questionnaires_updated_at
before update on public.questionnaires
for each row execute function public.set_updated_at();

alter table public.questionnaires enable row level security;

grant select, insert, update, delete
on public.questionnaires to authenticated, service_role;

drop policy if exists "CRM users manage questionnaires" on public.questionnaires;

create policy "CRM users manage questionnaires"
on public.questionnaires for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
