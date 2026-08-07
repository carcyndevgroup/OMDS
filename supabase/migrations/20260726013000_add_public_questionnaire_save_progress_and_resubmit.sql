create or replace function public.save_client_portal_questionnaire_progress_by_key(
  input_access_key uuid,
  input_questionnaire_id uuid,
  input_response_data jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event_id uuid;
begin
  select access.event_id
  into target_event_id
  from public.client_portal_access as access
  join public.questionnaires as questionnaire
    on questionnaire.event_id = access.event_id
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.questionnaires_visible
    and questionnaire.id = input_questionnaire_id
    and questionnaire.status in ('sent', 'submitted')
  limit 1;

  if target_event_id is null then
    raise exception 'questionnaire_not_available';
  end if;

  update public.questionnaires
  set
    response_data = input_response_data,
    updated_at = now()
  where id = input_questionnaire_id;

  perform public.sync_client_portal_access(target_event_id);
end;
$$;

revoke all on function public.save_client_portal_questionnaire_progress_by_key(
  uuid, uuid, jsonb
) from public;

grant execute on function public.save_client_portal_questionnaire_progress_by_key(
  uuid, uuid, jsonb
) to anon, authenticated, service_role;

create or replace function public.submit_client_portal_questionnaire_by_key(
  input_access_key uuid,
  input_questionnaire_id uuid,
  input_response_data jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event_id uuid;
begin
  select access.event_id
  into target_event_id
  from public.client_portal_access as access
  join public.questionnaires as questionnaire
    on questionnaire.event_id = access.event_id
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.questionnaires_visible
    and questionnaire.id = input_questionnaire_id
    and questionnaire.status in ('sent', 'submitted')
  limit 1;

  if target_event_id is null then
    raise exception 'questionnaire_not_available';
  end if;

  update public.questionnaires
  set
    response_data = input_response_data,
    review_status = 'pending_review',
    status = 'submitted',
    submitted_at = now(),
    updated_at = now()
  where id = input_questionnaire_id;

  perform public.sync_client_portal_access(target_event_id);
end;
$$;

revoke all on function public.submit_client_portal_questionnaire_by_key(
  uuid, uuid, jsonb
) from public;

grant execute on function public.submit_client_portal_questionnaire_by_key(
  uuid, uuid, jsonb
) to anon, authenticated, service_role;
