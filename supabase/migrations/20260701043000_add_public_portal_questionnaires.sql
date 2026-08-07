create or replace function public.get_client_portal_questionnaires_by_key(
  input_access_key uuid
)
returns table (
  questionnaire_id uuid,
  title text,
  status text,
  template_key text,
  sent_at timestamptz,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    questionnaire.id,
    questionnaire.title,
    questionnaire.status,
    questionnaire.template_key,
    questionnaire.sent_at,
    questionnaire.submitted_at
  from public.client_portal_access as access
  join public.questionnaires as questionnaire
    on questionnaire.event_id = access.event_id
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.questionnaires_visible
    and questionnaire.status in ('sent', 'submitted')
  order by questionnaire.created_at;
$$;

revoke all on function public.get_client_portal_questionnaires_by_key(uuid)
from public;

grant execute on function public.get_client_portal_questionnaires_by_key(uuid)
to anon, authenticated, service_role;
