create table if not exists public.crm_activity_log (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('leads', 'clients')),
  record_id uuid not null,
  event_type text not null,
  summary text not null,
  actor_id uuid references auth.users(id) on delete set null,
  linked_path text,
  created_at timestamptz not null default now()
);

create index if not exists crm_activity_log_record_idx
  on public.crm_activity_log(entity, record_id, created_at desc);

alter table public.crm_activity_log enable row level security;

drop policy if exists "CRM users read activity log" on public.crm_activity_log;
create policy "CRM users read activity log"
on public.crm_activity_log
for select to authenticated
using ((select private.is_crm_user()));

drop policy if exists "CRM users create activity log" on public.crm_activity_log;
create policy "CRM users create activity log"
on public.crm_activity_log
for insert to authenticated
with check ((select private.is_crm_user()));

create or replace function public.record_crm_activity(
  target_entity text,
  target_record_id uuid,
  target_event_type text,
  target_summary text,
  target_linked_path text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_id uuid;
begin
  if target_entity not in ('leads', 'clients') then
    raise exception 'invalid activity entity';
  end if;
  if not exists (
    select 1 from public.app_users
    where id = auth.uid() and role in ('owner', 'staff')
  ) then
    raise exception 'crm user required';
  end if;
  insert into public.crm_activity_log
    (entity, record_id, event_type, summary, actor_id, linked_path)
  values
    (target_entity, target_record_id, target_event_type, target_summary, auth.uid(), target_linked_path)
  returning id into activity_id;
  return activity_id;
end;
$$;

revoke all on function public.record_crm_activity(text, uuid, text, text, text) from public;
grant execute on function public.record_crm_activity(text, uuid, text, text, text) to authenticated;

create or replace function public.set_crm_archive_state(
  target_entity text,
  target_record_id uuid,
  target_archived boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_id uuid;
begin
  if target_entity not in ('clients', 'leads') then raise exception 'invalid archive entity'; end if;
  if not exists (select 1 from public.app_users where id = auth.uid() and role = 'owner') then
    raise exception 'owner required';
  end if;
  if target_entity = 'clients' then
    update public.clients set archived_at = case when target_archived then now() else null end
      where id = target_record_id returning id into updated_id;
  else
    update public.leads set archived_at = case when target_archived then now() else null end
      where id = target_record_id returning id into updated_id;
  end if;
  if updated_id is null then return null; end if;
  insert into public.crm_archive_audit_events (entity, record_id, archived, changed_by)
    values (target_entity, target_record_id, target_archived, auth.uid());
  insert into public.crm_activity_log (entity, record_id, event_type, summary, actor_id)
    values (target_entity, target_record_id,
      case when target_archived then 'archived' else 'unarchived' end,
      case when target_archived then 'Record archived' else 'Record restored' end,
      auth.uid());
  return updated_id;
end;
$$;

revoke all on function public.set_crm_archive_state(text, uuid, boolean) from public;
grant execute on function public.set_crm_archive_state(text, uuid, boolean) to authenticated;
