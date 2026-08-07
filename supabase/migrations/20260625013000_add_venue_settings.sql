alter table public.venues
add column if not exists payment_responsibility text not null default 'venue_hotel'
check (payment_responsibility in ('venue_hotel', 'client', 'planner', 'case_by_case')),
add column if not exists commission_model text not null default 'fixed_percentage'
check (commission_model in ('none', 'fixed_percentage', 'fixed_amount', 'venue_markup', 'notes_only')),
add column if not exists commission_percentage numeric,
add column if not exists commission_fixed_amount numeric,
add column if not exists factura_recipient text not null default 'venue_hotel'
check (factura_recipient in ('venue_hotel', 'client', 'planner', 'case_by_case')),
add column if not exists quote_pricing_model text not null default 'pv_commission'
check (quote_pricing_model in ('direct', 'pv_commission', 'custom', 'case_by_case')),
add column if not exists invoice_behavior text not null default 'venue_fiscal_factura'
check (invoice_behavior in ('omds_client_invoice', 'venue_fiscal_factura', 'both', 'venue_handles', 'case_by_case')),
add column if not exists brochure_behavior text not null default 'pv_brochure'
check (brochure_behavior in ('direct_brochure', 'pv_brochure', 'case_by_case')),
add column if not exists suppress_client_invoice boolean not null default true,
add column if not exists settings_notes text not null default '';

update public.venues
set
  payment_responsibility = 'client',
  commission_model = 'none',
  factura_recipient = 'client',
  quote_pricing_model = 'direct',
  invoice_behavior = 'omds_client_invoice',
  brochure_behavior = 'direct_brochure',
  suppress_client_invoice = false
where not is_preferred_vendor;
