alter table public.invoices
add column if not exists installment_key text not null default 'single' check (
  installment_key in ('single', 'retainer', 'balance')
);

alter table public.invoices
drop constraint if exists invoices_event_id_invoice_type_key;

alter table public.invoices
add constraint invoices_event_invoice_installment_key_key unique (event_id, invoice_type, installment_key);
