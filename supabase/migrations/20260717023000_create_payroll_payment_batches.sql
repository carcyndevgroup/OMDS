create table if not exists public.payroll_payment_batches (
  id uuid primary key default gen_random_uuid(),
  scheduled_pay_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'scheduled', 'paid', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_payment_batch_items (
  batch_id uuid not null references public.payroll_payment_batches(id) on delete cascade,
  line_item_id uuid not null references public.event_payroll_line_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (batch_id, line_item_id),
  unique (line_item_id)
);

create or replace function public.next_payroll_wednesday(input_date date)
returns date
language sql
immutable
set search_path = ''
as $$
  select input_date + (
    case
      when ((3 - extract(dow from input_date)::integer + 7) % 7) = 0 then 7
      else ((3 - extract(dow from input_date)::integer + 7) % 7)
    end
  );
$$;

create or replace function public.set_event_payroll_scheduled_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  source_event_date date;
begin
  if new.scheduled_pay_date is null then
    select event_date into source_event_date
    from public.events
    where id = new.event_id;

    new.scheduled_pay_date := public.next_payroll_wednesday(
      coalesce(source_event_date, current_date)
    );
  end if;

  return new;
end;
$$;

update public.event_payroll_line_items as item
set scheduled_pay_date = public.next_payroll_wednesday(event.event_date)
from public.events as event
where event.id = item.event_id
  and item.scheduled_pay_date is null;

drop trigger if exists set_event_payroll_scheduled_date
on public.event_payroll_line_items;

create trigger set_event_payroll_scheduled_date
before insert or update on public.event_payroll_line_items
for each row execute function public.set_event_payroll_scheduled_date();

drop trigger if exists set_payroll_payment_batches_updated_at
on public.payroll_payment_batches;

create trigger set_payroll_payment_batches_updated_at
before update on public.payroll_payment_batches
for each row execute function public.set_updated_at();

alter table public.payroll_payment_batches enable row level security;
alter table public.payroll_payment_batch_items enable row level security;

grant select, insert, update, delete
on public.payroll_payment_batches, public.payroll_payment_batch_items
to authenticated, service_role;

drop policy if exists "CRM users manage payroll payment batches"
on public.payroll_payment_batches;

create policy "CRM users manage payroll payment batches"
on public.payroll_payment_batches for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage payroll payment batch items"
on public.payroll_payment_batch_items;

create policy "CRM users manage payroll payment batch items"
on public.payroll_payment_batch_items for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

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
    and status in ('estimated', 'approved', 'scheduled');

  return new_batch_id;
end;
$$;

revoke all on function public.create_payroll_payment_batch(date, uuid[], text)
from public;

grant execute on function public.create_payroll_payment_batch(date, uuid[], text)
to authenticated, service_role;
