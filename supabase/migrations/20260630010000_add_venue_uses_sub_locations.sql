alter table public.venues
add column if not exists uses_sub_locations boolean not null default false;

update public.venues as venue
set uses_sub_locations = true
where exists (
  select 1
  from public.venue_sub_locations as sub_location
  where sub_location.venue_id = venue.id
)
or exists (
  select 1
  from public.events as event
  where event.venue_id = venue.id
    and (
      event.venue_sub_location_id is not null
      or event.venue_sub_location_other <> ''
    )
);
