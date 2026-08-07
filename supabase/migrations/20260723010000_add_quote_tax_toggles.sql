alter table public.quote_versions
add column if not exists applies_iva_tax boolean not null default true,
add column if not exists applies_iva_retention boolean not null default false,
add column if not exists applies_isr_retention boolean not null default false,
add column if not exists iva_retention_rate_percent numeric(7,4) not null default 10.6667 check (iva_retention_rate_percent >= 0),
add column if not exists isr_retention_rate_percent numeric(7,4) not null default 10 check (isr_retention_rate_percent >= 0),
add column if not exists iva_tax_mxn numeric(12,2) not null default 0 check (iva_tax_mxn >= 0),
add column if not exists iva_retention_mxn numeric(12,2) not null default 0 check (iva_retention_mxn >= 0),
add column if not exists isr_retention_mxn numeric(12,2) not null default 0 check (isr_retention_mxn >= 0);

update public.quote_versions
set iva_tax_mxn = tax_total_mxn
where iva_tax_mxn = 0
  and tax_total_mxn > 0;
