create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_users (id, role)
select id, 'owner'
from auth.users
order by created_at asc
limit 1
on conflict (id) do update set role = 'owner';

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.app_users (id, role)
  values (new.id, 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop trigger if exists set_app_users_updated_at on public.app_users;

create trigger set_app_users_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_crm_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_users
    where id = (select auth.uid())
      and role in ('owner', 'staff')
  );
$$;

revoke all on function private.is_crm_user() from public;
grant execute on function private.is_crm_user() to authenticated;

alter table public.app_users enable row level security;

revoke all on public.app_users from anon, authenticated;
grant select on public.app_users to authenticated;

drop policy if exists "Users read their own CRM role" on public.app_users;
create policy "Users read their own CRM role"
on public.app_users
for select
to authenticated
using (id = (select auth.uid()));

grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.lead_services to authenticated;

drop policy if exists "CRM users manage leads" on public.leads;
create policy "CRM users manage leads"
on public.leads
for all
to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage lead services" on public.lead_services;
create policy "CRM users manage lead services"
on public.lead_services
for all
to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
