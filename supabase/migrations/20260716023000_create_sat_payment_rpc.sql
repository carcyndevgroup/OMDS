create or replace function public.create_sat_payment_with_allocations(input jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_payment_id uuid;
  allocation jsonb;
  selected_factura public.event_sat_facturas%rowtype;
  applied_total numeric(14,6) := 0;
  payment_amount numeric(14,6) := (input->>'amountMxn')::numeric;
  allocation_amount numeric(14,6);
  allocation_sum numeric(14,6);
begin
  if payment_amount <= 0 then
    raise exception 'invalid_payment_amount';
  end if;

  insert into public.sat_payments (
    venue_id, bank_account_id, payment_date, amount_mxn,
    reference, proof_file_url, notes
  )
  values (
    nullif(input->>'venueId', '')::uuid,
    nullif(input->>'bankAccountId', '')::uuid,
    (input->>'paymentDate')::date,
    payment_amount,
    coalesce(input->>'reference', ''),
    coalesce(input->>'proofFileUrl', ''),
    coalesce(input->>'notes', '')
  )
  returning id into new_payment_id;

  for allocation in
    select * from jsonb_array_elements(coalesce(input->'allocations', '[]'::jsonb))
  loop
    allocation_amount := (allocation->>'amountMxn')::numeric;
    if allocation_amount <= 0 then
      raise exception 'invalid_allocation_amount';
    end if;

    select * into selected_factura
    from public.event_sat_facturas
    where id = (allocation->>'facturaId')::uuid
    for update;

    if not found then raise exception 'factura_not_found'; end if;

    insert into public.sat_payment_facturas (
      payment_id, factura_id, amount_applied_mxn
    )
    values (new_payment_id, selected_factura.id, allocation_amount);

    select coalesce(sum(amount_applied_mxn), 0)
    into allocation_sum
    from public.sat_payment_facturas
    where factura_id = selected_factura.id;

    update public.event_sat_facturas
    set
      paid_at = coalesce(paid_at, (input->>'paymentDate')::date),
      status = case
        when allocation_sum >= selected_factura.total_mxn then 'paid'
        else 'partially_paid'
      end,
      complemento_status = case
        when requires_complemento then 'pending'
        else complemento_status
      end
    where id = selected_factura.id;

    applied_total := applied_total + allocation_amount;
  end loop;

  if applied_total <= 0 then
    raise exception 'no_allocations';
  end if;

  if applied_total > payment_amount then
    raise exception 'allocations_exceed_payment';
  end if;

  return new_payment_id;
end;
$$;

revoke all on function public.create_sat_payment_with_allocations(jsonb)
from public;

grant execute on function public.create_sat_payment_with_allocations(jsonb)
to authenticated, service_role;
