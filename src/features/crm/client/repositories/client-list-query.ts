import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import { getCancunDate } from "../../shared/utils/cancun-date";
import type { BookingStatus } from "../../shared/types/crm-options";
import type { ClientListItem } from "../types/client";

type EventSummaryRow = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "booking_status" | "event_date" | "id" | "venue_name"
>;

export async function listClientSummaries(
  client: SupabaseClient<Database>,
  includeArchived = false,
): Promise<ClientListItem[]> {
  let clientsQuery = client
    .from("clients")
    .select("id, first_name, last_name, email, phone, company_name, archived_at")
    .order("created_at", { ascending: false });
  if (!includeArchived) clientsQuery = clientsQuery.is("archived_at", null);
  const clients = await clientsQuery;

  if (clients.error) throw clients.error;
  if (clients.data.length === 0) return [];

  const contacts = await client
    .from("event_contacts")
    .select("client_id, event_id")
    .in(
      "client_id",
      clients.data.map((item) => item.id),
    );

  if (contacts.error) throw contacts.error;
  const eventIds = contacts.data.map((contact) => contact.event_id);
  let events: EventSummaryRow[] = [];

  if (eventIds.length) {
    const result = await client
      .from("events")
      .select("id, event_date, venue_name, booking_status")
      .in("id", eventIds)
      .gte("event_date", getCancunDate())
      .order("event_date", { ascending: true });

    if (result.error) throw result.error;
    events = result.data;
  }

  const clientByEvent = new Map(
    contacts.data.map((contact) => [contact.event_id, contact.client_id]),
  );
  const nextEventByClient = new Map<string, EventSummaryRow>();

  events.forEach((event) => {
    const clientId = clientByEvent.get(event.id);
    if (clientId && !nextEventByClient.has(clientId)) {
      nextEventByClient.set(clientId, event);
    }
  });

  return clients.data.map((item) => {
    const event = nextEventByClient.get(item.id);
    return {
      archivedAt: item.archived_at,
      companyName: item.company_name,
      email: item.email,
      firstName: item.first_name,
      id: item.id,
      lastName: item.last_name,
      nextEvent: event
        ? {
            bookingStatus: event.booking_status as BookingStatus,
            eventDate: event.event_date,
            eventId: event.id,
            venueName: event.venue_name,
          }
        : null,
      phone: item.phone,
    };
  });
}
