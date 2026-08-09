alter table public.message_drafts
  add column if not exists client_id uuid references public.clients(id) on delete cascade;

alter table public.message_drafts
  drop constraint if exists message_drafts_user_id_lead_id_key;

alter table public.message_drafts
  drop constraint if exists message_drafts_crm_target_check;

alter table public.message_drafts
  add constraint message_drafts_crm_target_check
  check ((lead_id is not null) <> (client_id is not null));

create unique index if not exists message_drafts_user_lead_idx
  on public.message_drafts(user_id, lead_id)
  where lead_id is not null;
create unique index if not exists message_drafts_user_client_idx
  on public.message_drafts(user_id, client_id)
  where client_id is not null;
create index if not exists message_drafts_client_idx
  on public.message_drafts(client_id, updated_at desc);
