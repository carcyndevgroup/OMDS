update public.leads
set status = 'converted'
where status = 'event_complete';

update public.leads
set status = 'lost'
where status = 'closed';

alter table public.leads
drop constraint if exists leads_status_check;

alter table public.leads
add constraint leads_status_check
check (
  status in (
    'new',
    'contacted',
    'waiting_on_lead',
    'converted',
    'lost',
    'spam'
  )
);
