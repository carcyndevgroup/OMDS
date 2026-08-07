insert into storage.buckets (id, name, public, file_size_limit)
values ('portal-questionnaire-uploads', 'portal-questionnaire-uploads', false, 15728640)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Portal questionnaire uploads select" on storage.objects;
create policy "Portal questionnaire uploads select"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'portal-questionnaire-uploads'
  and exists (
    select 1
    from public.client_portal_access as access
    where access.access_key::text = split_part(name, '/', 1)
      and access.revoked_at is null
      and access.questionnaires_visible
  )
);

drop policy if exists "Portal questionnaire uploads insert" on storage.objects;
create policy "Portal questionnaire uploads insert"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'portal-questionnaire-uploads'
  and exists (
    select 1
    from public.client_portal_access as access
    where access.access_key::text = split_part(name, '/', 1)
      and access.revoked_at is null
      and access.questionnaires_visible
  )
);
