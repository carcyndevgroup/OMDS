create table if not exists public.event_message_drafts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  document_kind text not null check (document_kind in ('questionnaire', 'contract', 'invoice', 'quote', 'general')),
  document_id uuid,
  channel text not null default 'email' check (channel in ('email')),
  status text not null default 'draft' check (status in ('draft', 'sent')),
  subject text not null default '',
  body text not null default '',
  recipients jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_message_drafts_event_idx
on public.event_message_drafts(event_id, created_at desc);

drop trigger if exists set_event_message_drafts_updated_at on public.event_message_drafts;

create trigger set_event_message_drafts_updated_at
before update on public.event_message_drafts
for each row execute function public.set_updated_at();

alter table public.event_message_drafts enable row level security;

grant select, insert, update, delete
on public.event_message_drafts to authenticated, service_role;

drop policy if exists "CRM users manage event message drafts" on public.event_message_drafts;

create policy "CRM users manage event message drafts"
on public.event_message_drafts for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
