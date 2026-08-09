create table if not exists public.message_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  recipient text not null default '',
  subject text not null default '',
  body text not null default '',
  template_key text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((lead_id is not null) <> (client_id is not null))
);

create unique index if not exists message_drafts_user_lead_idx
  on public.message_drafts(user_id, lead_id)
  where lead_id is not null;
create unique index if not exists message_drafts_user_client_idx
  on public.message_drafts(user_id, client_id)
  where client_id is not null;
create index if not exists message_drafts_lead_idx
  on public.message_drafts(lead_id, updated_at desc);

alter table public.message_drafts enable row level security;

drop policy if exists "CRM users manage own message drafts" on public.message_drafts;
create policy "CRM users manage own message drafts"
on public.message_drafts for all to authenticated
using (user_id = auth.uid() and (select private.is_messages_user()))
with check (user_id = auth.uid() and (select private.is_messages_user()));