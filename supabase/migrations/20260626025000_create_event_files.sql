create table if not exists public.event_files (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  notes text not null default '',
  include_on_run_sheet boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_files_event_idx
on public.event_files(event_id);

create index if not exists event_files_run_sheet_idx
on public.event_files(event_id)
where include_on_run_sheet;

drop trigger if exists set_event_files_updated_at
on public.event_files;

create trigger set_event_files_updated_at
before update on public.event_files
for each row execute function public.set_updated_at();

alter table public.event_files enable row level security;

grant select, insert, update, delete
on public.event_files to authenticated, service_role;

drop policy if exists "CRM users manage event files"
on public.event_files;

create policy "CRM users manage event files"
on public.event_files for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
