create or replace function public.get_sat_due_date(
  event_date date,
  due_rule text,
  due_day integer
)
returns date
language sql
immutable
set search_path = ''
as $$
  select case due_rule
    when 'same_day' then event_date
    when 'next_day' then event_date + 1
    when 'monthly_same_month' then make_date(
      extract(year from event_date)::int,
      extract(month from event_date)::int,
      least(coalesce(due_day, 1), 28)
    )
    when 'monthly_cutoff' then make_date(
      extract(year from event_date)::int,
      extract(month from event_date)::int,
      least(coalesce(due_day, 1), 28)
    )
    else null
  end;
$$;

update public.event_sat_facturas as factura
set due_at = public.get_sat_due_date(
  event.event_date,
  venue.fiscal_due_rule,
  venue.fiscal_due_day
)
from public.events as event
join public.venues as venue
  on venue.id = coalesce(event.payment_partner_venue_id, event.venue_id)
where factura.event_id = event.id
  and factura.creation_source = 'auto_pv_confirmation'
  and venue.fiscal_due_rule = 'monthly_cutoff';
