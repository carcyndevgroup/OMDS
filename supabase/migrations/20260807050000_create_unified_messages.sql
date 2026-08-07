create table if not exists public.message_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('email', 'instagram', 'facebook', 'tiktok')),
  display_name text not null,
  address text,
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'error', 'paused')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references public.message_connections(id) on delete set null,
  provider text not null check (provider in ('email', 'instagram', 'facebook', 'tiktok')),
  provider_thread_id text,
  subject text not null default '',
  preview text not null default '',
  last_message_at timestamptz not null default now(),
  unread_count integer not null default 0 check (unread_count >= 0),
  is_starred boolean not null default false,
  is_archived boolean not null default false,
  assigned_to uuid references auth.users(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  labels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists message_threads_provider_thread_idx
  on public.message_threads(provider, provider_thread_id)
  where provider_thread_id is not null;
create index if not exists message_threads_inbox_idx
  on public.message_threads(last_message_at desc, is_archived, assigned_to);
create index if not exists message_threads_crm_idx
  on public.message_threads(lead_id, client_id, event_id);

create table if not exists public.message_participants (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  address text not null,
  display_name text not null default '',
  participant_role text not null check (participant_role in ('from', 'to', 'cc', 'bcc')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  provider_message_id text,
  in_reply_to_id uuid references public.messages(id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_address text not null,
  sender_name text not null default '',
  subject text not null default '',
  body_text text not null default '',
  body_html text,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists messages_provider_id_idx
  on public.messages(provider_message_id)
  where provider_message_id is not null;
create index if not exists messages_thread_date_idx
  on public.messages(thread_id, sent_at asc);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_name text not null,
  content_type text not null default 'application/octet-stream',
  byte_size bigint not null default 0,
  storage_path text not null,
  provider_attachment_id text,
  created_at timestamptz not null default now()
);

create or replace function private.is_messages_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.app_users
    where id = auth.uid() and role in ('owner', 'staff')
  );
$$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('message-attachments', 'message-attachments', false, 26214400)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "CRM users read message attachments" on storage.objects;
create policy "CRM users read message attachments"
on storage.objects for select to authenticated
using (bucket_id = 'message-attachments' and (select private.is_messages_user()));

drop policy if exists "CRM users upload message attachments" on storage.objects;
create policy "CRM users upload message attachments"
on storage.objects for insert to authenticated
with check (bucket_id = 'message-attachments' and (select private.is_messages_user()));

drop policy if exists "CRM users delete message attachments" on storage.objects;
create policy "CRM users delete message attachments"
on storage.objects for delete to authenticated
using (bucket_id = 'message-attachments' and (select private.is_messages_user()));

alter table public.message_connections enable row level security;
alter table public.message_threads enable row level security;
alter table public.message_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;

do $policies$
declare
  table_name text;
begin
  foreach table_name in array array['message_connections', 'message_threads', 'message_participants', 'messages', 'message_attachments'] loop
    execute format('drop policy if exists "CRM users read %1$s" on public.%1$s', table_name);
    execute format('create policy "CRM users read %1$s" on public.%1$s for select to authenticated using ((select private.is_messages_user()))', table_name);
    execute format('drop policy if exists "CRM users write %1$s" on public.%1$s', table_name);
    execute format('create policy "CRM users write %1$s" on public.%1$s for all to authenticated using ((select private.is_messages_user())) with check ((select private.is_messages_user()))', table_name);
  end loop;
end;
$policies$;
