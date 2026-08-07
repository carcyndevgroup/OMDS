import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { DashboardMonthEvent } from "../types/dashboard";

export type DashboardEventRow = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "booking_status" | "event_date" | "guest_count" | "id" | "service_start_time" | "venue_name"
>;

type ClientRow = Pick<
  Database["public"]["Tables"]["clients"]["Row"],
  "first_name" | "id" | "last_name"
>;

const nameOf = (client?: ClientRow) => {
  return client ? `${client.first_name} ${client.last_name}`.trim() : "";
};

export async function hydrateDashboardEvents(
  database: SupabaseClient<Database>,
  events: DashboardEventRow[],
): Promise<DashboardMonthEvent[]> {
  const eventIds = events.map((event) => event.id);
  const [contacts, productsByEvent] = await Promise.all([
    database
      .from("event_contacts")
      .select("event_id, client_id")
      .eq("is_primary", true)
      .in("event_id", eventIds),
    listAcceptedProductsByEvent(database, eventIds),
  ]);

  if (contacts.error) throw contacts.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const clients = clientIds.length
    ? await database
        .from("clients")
        .select("id, first_name, last_name")
        .in("id", clientIds)
    : { data: [], error: null };

  if (clients.error) throw clients.error;

  const contactByEvent = new Map(
    contacts.data.map((contact) => [contact.event_id, contact.client_id]),
  );
  const clientById = new Map(clients.data.map((client) => [client.id, client]));

  return events.map((event) => {
    const clientId = contactByEvent.get(event.id) ?? "";
    const client = clientById.get(clientId);

    return {
      acceptedProductNames: productsByEvent.get(event.id) ?? [],
      bookingStatus: event.booking_status,
      clientName: nameOf(client),
      eventDate: event.event_date,
      eventId: event.id,
      guestCount: event.guest_count,
      serviceStartTime: event.service_start_time ?? "",
      venueName: event.venue_name,
    };
  });
}

async function listAcceptedProductsByEvent(
  database: SupabaseClient<Database>,
  eventIds: string[],
) {
  const quotes = await database
    .from("quotes")
    .select("event_id, accepted_version_id")
    .eq("status", "accepted")
    .in("event_id", eventIds);

  if (quotes.error) throw quotes.error;

  const versionEventPairs = quotes.data
    .filter((quote) => quote.accepted_version_id)
    .map((quote) => ({
      eventId: quote.event_id,
      versionId: quote.accepted_version_id as string,
    }));

  if (!versionEventPairs.length) return new Map<string, string[]>();

  const eventByVersion = new Map(
    versionEventPairs.map((pair) => [pair.versionId, pair.eventId]),
  );
  const items = await database
    .from("quote_items")
    .select("quote_version_id, description, sort_order")
    .in("quote_version_id", versionEventPairs.map((pair) => pair.versionId))
    .order("sort_order", { ascending: true });

  if (items.error) throw items.error;

  return items.data.reduce((map, item) => {
    const eventId = eventByVersion.get(item.quote_version_id);
    if (!eventId) return map;

    const names = map.get(eventId) ?? [];
    map.set(eventId, [...names, item.description]);
    return map;
  }, new Map<string, string[]>());
}
