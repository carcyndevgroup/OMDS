create table if not exists public.crm_archive_audit_events (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('clients', 'leads')),
  record_id uuid not null,
  archived boolean not null,
  changed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists crm_archive_audit_record_idx
  on public.crm_archive_audit_events(entity, record_id, created_at desc);

alter table public.crm_archive_audit_events enable row level security;

drop policy if exists "CRM users read archive audit events"
on public.crm_archive_audit_events;

create policy "CRM users read archive audit events"
on public.crm_archive_audit_events
for select to authenticated
using ((select private.is_crm_user()));

drop policy if exists "Owners create archive audit events"
on public.crm_archive_audit_events;

create policy "Owners create archive audit events"
on public.crm_archive_audit_events
for insert to authenticated
with check (exists (
  select 1 from public.app_users
  where id = (select auth.uid()) and role = 'owner'
));

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
  if target_entity not in ('clients', 'leads') then
    raise exception 'invalid archive entity';
  end if;

  if not exists (
    select 1 from public.app_users
    where id = auth.uid() and role = 'owner'
  ) then
    raise exception 'owner required';
  end if;

  if target_entity = 'clients' then
    update public.clients
    set archived_at = case when target_archived then now() else null end
    where id = target_record_id
    returning id into updated_id;
  else
    update public.leads
    set archived_at = case when target_archived then now() else null end
    where id = target_record_id
    returning id into updated_id;
  end if;

  if updated_id is null then
    return null;
  end if;

  insert into public.crm_archive_audit_events (entity, record_id, archived, changed_by)
  values (target_entity, target_record_id, target_archived, auth.uid());
  return updated_id;
end;
$$;

revoke all on function public.set_crm_archive_state(text, uuid, boolean) from public;
grant execute on function public.set_crm_archive_state(text, uuid, boolean) to authenticated;