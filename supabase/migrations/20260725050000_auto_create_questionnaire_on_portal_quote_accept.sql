create or replace function public.respond_client_portal_quote_by_key(
  input_access_key uuid,
  input_quote_id uuid,
  input_action text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event_id uuid;
  target_quote_id uuid;
  target_version_id uuid;
  target_questionnaire_template_key text;
  selected_status text;
begin
  if input_action not in ('accept', 'decline') then
    raise exception 'invalid_quote_action';
  end if;

  select
    access.event_id,
    quote.id,
    version.id,
    version.questionnaire_template_key
  into
    target_event_id,
    target_quote_id,
    target_version_id,
    target_questionnaire_template_key
  from public.client_portal_access as access
  join public.quotes as quote on quote.event_id = access.event_id
  join lateral (
    select *
    from public.quote_versions as quote_version
    where quote_version.quote_id = quote.id
      and quote_version.status in ('sent', 'viewed')
    order by quote_version.version_number desc
    limit 1
  ) as version on true
  where access.access_key = input_access_key
    and access.revoked_at is null
    and access.quotes_visible
    and quote.id = input_quote_id
    and quote.status in ('sent', 'viewed')
  limit 1;

  if target_quote_id is null then
    raise exception 'quote_not_available';
  end if;

  if input_action = 'accept' then
    update public.quotes
    set accepted_version_id = null, status = 'declined'
    where event_id = target_event_id
      and id <> target_quote_id
      and status in ('sent', 'viewed');

    update public.quote_versions
    set status = 'declined'
    where quote_id in (
      select id from public.quotes
      where event_id = target_event_id and id <> target_quote_id
    )
      and status in ('sent', 'viewed');

    update public.quotes
    set accepted_version_id = target_version_id, status = 'accepted'
    where id = target_quote_id;

    update public.quote_versions
    set accepted_at = now(), status = 'accepted'
    where id = target_version_id;

    update public.events
    set booking_status = 'tentative_hold'
    where id = target_event_id;

    insert into public.questionnaires (
      event_id,
      locale,
      sent_at,
      status,
      template_key
    )
    select
      target_event_id,
      'en',
      now(),
      'sent',
      target_questionnaire_template_key
    where not exists (
      select 1
      from public.questionnaires as questionnaire
      where questionnaire.event_id = target_event_id
        and questionnaire.status in ('draft', 'sent', 'submitted')
    );
  else
    selected_status := 'declined';

    update public.quotes
    set status = selected_status
    where id = target_quote_id;

    update public.quote_versions
    set status = selected_status
    where id = target_version_id;
  end if;

  perform public.sync_client_portal_access(target_event_id);
end;
$$;

revoke all on function public.respond_client_portal_quote_by_key(uuid, uuid, text)
from public;

grant execute on function public.respond_client_portal_quote_by_key(uuid, uuid, text)
to anon, authenticated, service_role;
