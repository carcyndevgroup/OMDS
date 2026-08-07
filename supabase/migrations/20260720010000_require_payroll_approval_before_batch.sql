create or replace function public.create_payroll_payment_batch(
  input_scheduled_pay_date date,
  input_line_item_ids uuid[],
  input_notes text default ''
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_batch_id uuid;
begin
  if coalesce(array_length(input_line_item_ids, 1), 0) = 0 then
    raise exception 'payroll_batch_has_no_items';
  end if;

  if exists (
    select 1
    from public.event_payroll_line_items
    where id = any(input_line_item_ids)
      and status <> 'approved'
  ) then
    raise exception 'payroll_batch_requires_approved_items';
  end if;

  insert into public.payroll_payment_batches (scheduled_pay_date, status, notes)
  values (input_scheduled_pay_date, 'scheduled', coalesce(input_notes, ''))
  returning id into new_batch_id;

  insert into public.payroll_payment_batch_items (batch_id, line_item_id)
  select new_batch_id, line_item_id
  from unnest(input_line_item_ids) as line_item_id;

  update public.event_payroll_line_items
  set status = 'scheduled',
      scheduled_pay_date = input_scheduled_pay_date
  where id = any(input_line_item_ids)
    and status = 'approved';

  return new_batch_id;
end;
$$;

revoke all on function public.create_payroll_payment_batch(date, uuid[], text)
from public;

grant execute on function public.create_payroll_payment_batch(date, uuid[], text)
to authenticated, service_role;
