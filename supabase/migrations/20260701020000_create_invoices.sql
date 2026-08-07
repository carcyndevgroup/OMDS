create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  quote_version_id uuid references public.quote_versions(id) on delete set null,
  invoice_type text not null default 'omds_client_invoice' check (
    invoice_type in ('omds_client_invoice', 'pv_internal_factura')
  ),
  status text not null default 'draft' check (
    status in ('draft', 'issued', 'payment_promised', 'paid', 'void')
  ),
  client_visible boolean not null default true,
  display_currency text not null default 'mxn' check (
    display_currency in ('mxn', 'usd', 'cad')
  ),
  subtotal_mxn numeric(12,2) not null default 0 check (subtotal_mxn >= 0),
  tax_total_mxn numeric(12,2) not null default 0 check (tax_total_mxn >= 0),
  total_mxn numeric(12,2) not null default 0 check (total_mxn >= 0),
  due_at timestamptz,
  issued_at timestamptz,
  paid_at timestamptz,
  payment_promised_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, invoice_type)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  sort_order integer not null default 0,
  description text not null,
  details text not null default '',
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price_mxn numeric(12,2) not null default 0 check (unit_price_mxn >= 0),
  line_total_mxn numeric(12,2) not null default 0 check (line_total_mxn >= 0),
  is_taxable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_event_idx on public.invoices(event_id);
create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists set_invoice_items_updated_at on public.invoice_items;
create trigger set_invoice_items_updated_at
before update on public.invoice_items
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

grant select, insert, update, delete
on public.invoices, public.invoice_items to authenticated, service_role;

drop policy if exists "CRM users manage invoices" on public.invoices;
create policy "CRM users manage invoices" on public.invoices for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));

drop policy if exists "CRM users manage invoice items" on public.invoice_items;
create policy "CRM users manage invoice items" on public.invoice_items for all to authenticated
using ((select private.is_crm_user()))
with check ((select private.is_crm_user()));
