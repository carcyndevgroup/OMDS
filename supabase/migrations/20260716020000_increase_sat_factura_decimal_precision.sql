alter table public.event_sat_facturas
alter column source_total_mxn type numeric(14,6),
alter column commission_mxn type numeric(14,6),
alter column subtotal_mxn type numeric(14,6),
alter column iva_mxn type numeric(14,6),
alter column iva_retention_mxn type numeric(14,6),
alter column isr_retention_mxn type numeric(14,6),
alter column tax_total_mxn type numeric(14,6),
alter column total_mxn type numeric(14,6),
alter column unit_value_mxn type numeric(14,6);
