alter table public.quote_versions
add column if not exists payment_plan_id uuid references public.payment_plans(id) on delete set null;

create index if not exists quote_versions_payment_plan_idx
on public.quote_versions(payment_plan_id);
