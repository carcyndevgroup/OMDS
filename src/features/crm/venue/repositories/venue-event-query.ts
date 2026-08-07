import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  BookingStatus,
  EventType,
} from "../../shared/types/crm-options";
import type { BookingType } from "../../client/types/client";
import type { VenueEventListItem } from "../types/venue-event";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export async function listVenueEvents(
  client: SupabaseClient<Database>,
  venueId: string,
): Promise<VenueEventListItem[]> {
  const events = await client
    .from("events")
    .select("*")
    .or(`venue_id.eq.${venueId},payment_partner_venue_id.eq.${venueId}`)
    .order("event_date", { ascending: true });

  if (events.error) throw events.error;
  if (events.data.length === 0) return [];

  const eventIds = events.data.map((event) => event.id);
  const [contacts, services] = await Promise.all([
    client
      .from("event_contacts")
      .select("event_id, client_id")
      .in("event_id", eventIds)
      .eq("is_primary", true),
    client.from("event_services").select("event_id, service_id").in("event_id", eventIds),
  ]);

  if (contacts.error) throw contacts.error;
  if (services.error) throw services.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const clients = clientIds.length
    ? await client
        .from("clients")
        .select("id, first_name, last_name, email")
        .in("id", clientIds)
    : { data: [], error: null };

  if (clients.error) throw clients.error;

  const contactByEvent = new Map(
    contacts.data.map((contact) => [contact.event_id, contact.client_id]),
  );
  const clientById = new Map(clients.data.map((item) => [item.id, item]));
  const servicesByEvent = new Map<string, string[]>();

  services.data.forEach((service) => {
    servicesByEvent.set(service.event_id, [
      ...(servicesByEvent.get(service.event_id) ?? []),
      service.service_id,
    ]);
  });

  return events.data.map((event: EventRow) => {
    const clientId = contactByEvent.get(event.id) ?? "";
    const eventClient = clientById.get(clientId);

    return {
      bookingStatus: event.booking_status as BookingStatus,
      bookingType: event.booking_type as BookingType,
      clientEmail: eventClient?.email ?? "",
      clientId,
      clientName: eventClient
        ? `${eventClient.first_name} ${eventClient.last_name}`.trim()
        : "",
      eventDate: event.event_date,
      eventId: event.id,
      eventType: event.event_type as EventType,
      guestCount: event.guest_count,
      isPaymentPartnerEvent: event.payment_partner_venue_id === venueId,
      serviceIds: servicesByEvent.get(event.id) ?? [],
    };
  });
}
