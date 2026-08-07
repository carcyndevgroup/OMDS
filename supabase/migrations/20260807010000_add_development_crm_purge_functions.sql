create or replace function public.purge_crm_clients(target_client_ids uuid[])
returns table (deleted_client_count integer, deleted_event_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_ids uuid[];
  line_item_ids uuid[];
  payment_ids uuid[];
  deleted_clients integer;
  deleted_events integer;
begin
  if current_setting('app.environment', true) not in ('development', 'test', 'staging') then
    raise exception 'crm_purge_disabled_in_production';
  end if;

  if not exists (
    select 1 from public.app_users
    where id = (select auth.uid()) and role = 'owner'
  ) then
    raise exception 'crm_purge_owner_required';
  end if;

  select coalesce(array_agg(distinct event_id), '{}'::uuid[])
  into event_ids
  from public.event_contacts
  where client_id = any(target_client_ids);

  select coalesce(array_agg(id), '{}'::uuid[])
  into line_item_ids
  from public.event_payroll_line_items
  where event_id = any(event_ids);

  select coalesce(array_agg(distinct payment_id), '{}'::uuid[])
  into payment_ids
  from public.payroll_payment_items
  where line_item_id = any(line_item_ids);

  delete from public.payroll_payment_items
  where line_item_id = any(line_item_ids);

  delete from public.payroll_payment_batches
  where id in (
    select distinct batch_id
    from public.payroll_payment_batch_items
    where line_item_id = any(line_item_ids)
  );

  delete from public.payroll_payment_items
  where payment_id = any(payment_ids);

  delete from public.payroll_payments
  where id = any(payment_ids);

  delete from public.events where id = any(event_ids);
  get diagnostics deleted_events = row_count;

  delete from public.clients where id = any(target_client_ids);
  get diagnostics deleted_clients = row_count;

  return query select deleted_clients, deleted_events;
end;
$$;

create or replace function public.purge_crm_leads(target_lead_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_leads integer;
begin
  if current_setting('app.environment', true) not in ('development', 'test', 'staging') then
    raise exception 'crm_purge_disabled_in_production';
  end if;

  if not exists (
    select 1 from public.app_users
    where id = (select auth.uid()) and role = 'owner'
  ) then
    raise exception 'crm_purge_owner_required';
  end if;

  delete from public.leads where id = any(target_lead_ids);
  get diagnostics deleted_leads = row_count;
  return deleted_leads;
end;
$$;

revoke all on function public.purge_crm_clients(uuid[]) from public;
revoke all on function public.purge_crm_leads(uuid[]) from public;
grant execute on function public.purge_crm_clients(uuid[]) to authenticated, service_role;
grant execute on function public.purge_crm_leads(uuid[]) to authenticated, service_role;