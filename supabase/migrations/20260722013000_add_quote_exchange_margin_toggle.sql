alter table public.quote_versions
add column if not exists apply_exchange_rate_margin boolean not null default false;
