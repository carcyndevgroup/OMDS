create table if not exists public.payroll_payments (
  id uuid primary key default gen_random_uuid(),
  payment_method text not null check (payment_method in ('spei', 'cash')),
  cash_currency text check (cash_currency is null or cash_currency in ('mxn', 'usd')),
  sending_account text not null default '',
  receiving_account text not null default '',
  paid_at timestamptz not null default now(),
  transaction_id text not null default '',
  receipt_file_url text not null default '',
  bonus_mxn numeric(12,2) not null default 0 check (bonus_mxn >= 0),
  total_mxn numeric(12,2) not null default 0 check (total_mxn >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_payment_items (
  payment_id uuid not null references public.payroll_payments(id) on delete cascade,
  line_item_id uuid not null references public.event_payroll_line_items(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (payment_id, line_item_id),
  unique (line_item_id)
);

drop trigger if exists set_payroll_payments_updated_at
on public.payroll_payments;

create trigger set_payroll_payments_updated_at
before update on public.payroll_payments
for each row execute function public.set_updated_at();

alter table public.payroll_payments enable row level security;
alter table public.payroll_payment_items enable row level security;

grant select, insert, update, delete
on public.payroll_payments, public.payroll_payment_items
to authenticated, service_role;

drop policy if exists "CRM users manage payroll payments"
on public.payroll_payments;

create policy "CRM users manage payroll payments"
on public.payroll_payments for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage payroll payment items"
on public.payroll_payment_items;

create policy "CRM users manage payroll payment items"
on public.payroll_payment_items for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

create or replace function public.record_payroll_payment(
  input_line_item_ids uuid[],
  input_payment jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_payment_id uuid;
  payment_bonus numeric := coalesce((input_payment->>'bonusMxn')::numeric, 0);
  payment_total numeric;
begin
  select coalesce(sum(total_mxn), 0) + payment_bonus
  into payment_total
  from public.event_payroll_line_items
  where id = any(input_line_item_ids)
    and status = 'scheduled';

  if payment_total <= 0 then
    raise exception 'payroll_payment_has_no_scheduled_items';
  end if;

  insert into public.payroll_payments (
    payment_method, cash_currency, sending_account, receiving_account,
    paid_at, transaction_id, receipt_file_url, bonus_mxn, total_mxn, notes
  )
  values (
    input_payment->>'paymentMethod',
    nullif(input_payment->>'cashCurrency', ''),
    coalesce(input_payment->>'sendingAccount', ''),
    coalesce(input_payment->>'receivingAccount', ''),
    coalesce((input_payment->>'paidAt')::timestamptz, now()),
    coalesce(input_payment->>'transactionId', ''),
    coalesce(input_payment->>'receiptFileUrl', ''),
    payment_bonus,
    payment_total,
    coalesce(input_payment->>'notes', '')
  )
  returning id into new_payment_id;

  insert into public.payroll_payment_items (payment_id, line_item_id)
  select new_payment_id, line_item_id
  from unnest(input_line_item_ids) as line_item_id;

  update public.event_payroll_line_items
  set status = 'paid',
      paid_at = coalesce((input_payment->>'paidAt')::timestamptz, now())
  where id = any(input_line_item_ids)
    and status = 'scheduled';

  update public.payroll_payment_batches as batch
  set status = 'paid'
  where exists (
    select 1
    from public.payroll_payment_batch_items as item
    where item.batch_id = batch.id
      and item.line_item_id = any(input_line_item_ids)
  )
    and not exists (
      select 1
      from public.payroll_payment_batch_items as item
      join public.event_payroll_line_items as line on line.id = item.line_item_id
      where item.batch_id = batch.id
        and line.status <> 'paid'
    );

  return new_payment_id;
end;
$$;

revoke all on function public.record_payroll_payment(uuid[], jsonb)
from public;

grant execute on function public.record_payroll_payment(uuid[], jsonb)
to authenticated, service_role;
