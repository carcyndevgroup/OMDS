create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  retainer_percent numeric(5,2) not null default 40
    check (retainer_percent >= 0 and retainer_percent <= 100),
  retainer_due_rule text not null default 'contract_signature_invoice_generation'
    check (retainer_due_rule in ('contract_signature_invoice_generation')),
  retainer_grace_period_days integer not null default 3
    check (retainer_grace_period_days >= 0),
  final_payment_percent numeric(5,2) not null default 60
    check (final_payment_percent >= 0 and final_payment_percent <= 100),
  final_due_rule text not null default 'days_before_event'
    check (final_due_rule in ('days_before_event', 'none')),
  final_due_days_before_event integer not null default 14
    check (final_due_days_before_event >= 0),
  allow_adjusted_final_balance boolean not null default true,
  refund_notes text not null default '',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_plans_percent_total_check
    check (retainer_percent + final_payment_percent = 100)
);

create unique index if not exists payment_plans_one_default_idx
on public.payment_plans(is_default)
where is_default;

insert into public.payment_plans (
  name, retainer_percent, final_payment_percent, final_due_rule,
  final_due_days_before_event, allow_adjusted_final_balance,
  refund_notes, is_default
)
values
  ('40/60', 40, 60, 'days_before_event', 14, true, '', true),
  ('Full Payment', 100, 0, 'none', 14, false, 'Refund may apply if needed.', false)
on conflict (name) do nothing;

create or replace function public.ensure_single_default_payment_plan()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_default then
    update public.payment_plans
    set is_default = false
    where id <> new.id
      and is_default;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_single_default_payment_plan
on public.payment_plans;

create trigger ensure_single_default_payment_plan
before insert or update of is_default on public.payment_plans
for each row execute function public.ensure_single_default_payment_plan();

drop trigger if exists set_payment_plans_updated_at
on public.payment_plans;

create trigger set_payment_plans_updated_at
before update on public.payment_plans
for each row execute function public.set_updated_at();

alter table public.payment_plans enable row level security;

grant select, insert, update, delete
on public.payment_plans to authenticated, service_role;

drop policy if exists "CRM users manage payment plans"
on public.payment_plans;

create policy "CRM users manage payment plans"
on public.payment_plans for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
