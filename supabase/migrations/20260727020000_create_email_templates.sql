create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  title text not null,
  description text not null default '',
  document_kind text not null check (document_kind in ('questionnaire', 'contract', 'invoice', 'quote', 'general')),
  subject text not null default '',
  body text not null default '',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_templates_one_default_per_kind_idx
on public.email_templates(document_kind)
where is_default;

create or replace function public.ensure_single_default_email_template_per_kind()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_default then
    update public.email_templates
    set is_default = false
    where id <> new.id
      and document_kind = new.document_kind
      and is_default;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_single_default_email_template_per_kind
on public.email_templates;

create trigger ensure_single_default_email_template_per_kind
before insert or update of is_default, document_kind on public.email_templates
for each row execute function public.ensure_single_default_email_template_per_kind();

drop trigger if exists set_email_templates_updated_at
on public.email_templates;

create trigger set_email_templates_updated_at
before update on public.email_templates
for each row execute function public.set_updated_at();

alter table public.email_templates enable row level security;

grant select, insert, update, delete
on public.email_templates to authenticated, service_role;

drop policy if exists "CRM users manage email templates"
on public.email_templates;

create policy "CRM users manage email templates"
on public.email_templates for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

insert into public.email_templates (template_key, title, description, document_kind, subject, body, is_default)
values
  (
    'questionnaire_invite_standard',
    'Questionnaire Invite - Standard',
    'Default first-send message for questionnaire invites.',
    'questionnaire',
    'Questionnaire: Please Complete',
    'Please review and complete your booking questionnaire. Reply here if you have questions.',
    true
  ),
  (
    'questionnaire_reminder_followup',
    'Questionnaire Reminder - Follow Up',
    'Follow-up reminder for pending questionnaires.',
    'questionnaire',
    'Questionnaire Reminder',
    'Friendly reminder to complete your questionnaire at your earliest convenience.',
    false
  ),
  (
    'contract_send_standard',
    'Contract Send - Standard',
    'Default first-send message for contracts.',
    'contract',
    'Contract: Signature Requested',
    'Please review and sign your contract. Reply here if you need any clarifications.',
    true
  ),
  (
    'contract_reminder_followup',
    'Contract Reminder - Follow Up',
    'Follow-up reminder for pending contract signatures.',
    'contract',
    'Contract Reminder',
    'Friendly reminder to review and sign your contract. Let us know if you have questions.',
    false
  )
on conflict (template_key) do update
set
  title = excluded.title,
  description = excluded.description,
  document_kind = excluded.document_kind,
  subject = excluded.subject,
  body = excluded.body,
  is_default = excluded.is_default,
  is_active = true;
