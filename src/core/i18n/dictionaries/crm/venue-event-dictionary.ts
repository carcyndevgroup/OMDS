export const venueEventEn = {
  "crm.venue.event.empty": "No events are connected to this venue yet.",
  "crm.venue.event.guests": "guests",
  "crm.venue.event.loadError": "We could not load venue events.",
  "crm.venue.event.loading": "Loading venue events...",
  "crm.venue.event.paymentPartner": "Payment partner",
  "crm.venue.event.subtitle": "Bookings connected to this venue or its PV payment rules.",
  "crm.venue.event.title": "Venue Events",
  "crm.venue.event.viewClient": "View client",
} as const;

export type VenueEventTranslationKey = keyof typeof venueEventEn;

export const venueEventEs: Record<VenueEventTranslationKey, string> = {
  "crm.venue.event.empty": "Todavía no hay eventos conectados a este venue.",
  "crm.venue.event.guests": "invitados",
  "crm.venue.event.loadError": "No pudimos cargar los eventos del venue.",
  "crm.venue.event.loading": "Cargando eventos del venue...",
  "crm.venue.event.paymentPartner": "Partner de pago",
  "crm.venue.event.subtitle": "Reservaciones conectadas a este venue o a sus reglas de pago PV.",
  "crm.venue.event.title": "Eventos del venue",
  "crm.venue.event.viewClient": "Ver cliente",
};
