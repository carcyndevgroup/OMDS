create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')
  ),
  accepted_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, title)
);

create table if not exists public.quote_versions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'superseded')
  ),
  display_currency text not null default 'mxn' check (
    display_currency in ('mxn', 'usd', 'cad')
  ),
  exchange_rate_to_mxn numeric(12,6) not null default 1 check (exchange_rate_to_mxn > 0),
  exchange_rate_margin_percent numeric(5,2) not null default 3.5 check (exchange_rate_margin_percent >= 0),
  discount_type text not null default 'amount' check (discount_type in ('amount', 'percent')),
  discount_value_mxn numeric(12,2) not null default 0 check (discount_value_mxn >= 0),
  tax_rate_percent numeric(5,2) not null default 16 check (tax_rate_percent >= 0),
  items_total_mxn numeric(12,2) not null default 0 check (items_total_mxn >= 0),
  subtotal_mxn numeric(12,2) not null default 0 check (subtotal_mxn >= 0),
  tax_total_mxn numeric(12,2) not null default 0 check (tax_total_mxn >= 0),
  total_mxn numeric(12,2) not null default 0 check (total_mxn >= 0),
  expires_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quote_id, version_number)
);

alter table public.quotes
add constraint quotes_accepted_version_fk
foreign key (accepted_version_id)
references public.quote_versions(id)
on delete set null;

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_version_id uuid not null references public.quote_versions(id) on delete cascade,
  product_id uuid references public.product_catalog(id) on delete set null,
  sort_order integer not null default 0,
  description text not null,
  details text not null default '',
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  cog_mxn numeric(12,2) not null default 0 check (cog_mxn >= 0),
  unit_price_mxn numeric(12,2) not null default 0 check (unit_price_mxn >= 0),
  line_total_mxn numeric(12,2) not null default 0 check (line_total_mxn >= 0),
  is_taxable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_recipients (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (quote_id, email)
);

create unique index if not exists quotes_one_accepted_per_event_idx
on public.quotes(event_id)
where status = 'accepted';

create index if not exists quotes_event_idx on public.quotes(event_id);
create index if not exists quote_versions_quote_idx on public.quote_versions(quote_id);
create index if not exists quote_items_version_idx on public.quote_items(quote_version_id);
create index if not exists quote_recipients_quote_idx on public.quote_recipients(quote_id);

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

drop trigger if exists set_quote_versions_updated_at on public.quote_versions;
create trigger set_quote_versions_updated_at
before update on public.quote_versions
for each row execute function public.set_updated_at();

drop trigger if exists set_quote_items_updated_at on public.quote_items;
create trigger set_quote_items_updated_at
before update on public.quote_items
for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;
alter table public.quote_versions enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_recipients enable row level security;

grant select, insert, update, delete
on public.quotes, public.quote_versions, public.quote_items, public.quote_recipients
to authenticated, service_role;

drop policy if exists "CRM users manage quotes" on public.quotes;
create policy "CRM users manage quotes" on public.quotes for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage quote versions" on public.quote_versions;
create policy "CRM users manage quote versions" on public.quote_versions for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage quote items" on public.quote_items;
create policy "CRM users manage quote items" on public.quote_items for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage quote recipients" on public.quote_recipients;
create policy "CRM users manage quote recipients" on public.quote_recipients for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
