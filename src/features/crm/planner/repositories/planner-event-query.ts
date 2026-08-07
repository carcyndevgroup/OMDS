import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { BookingType } from "../../client/types/client";
import type {
  BookingStatus,
  EventType,
} from "../../shared/types/crm-options";
import type { PlannerEventListItem } from "../types/planner-event";

export async function listPlannerEvents(
  client: SupabaseClient<Database>,
  plannerId: string,
): Promise<PlannerEventListItem[]> {
  const links = await client
    .from("event_planners")
    .select("*")
    .eq("planner_id", plannerId);

  if (links.error) throw links.error;
  if (!links.data.length) return [];

  const eventIds = links.data.map((link) => link.event_id);
  const [events, contacts] = await Promise.all([
    client.from("events").select("*").in("id", eventIds).order("event_date"),
    client
      .from("event_contacts")
      .select("event_id, client_id")
      .in("event_id", eventIds)
      .eq("is_primary", true),
  ]);

  if (events.error) throw events.error;
  if (contacts.error) throw contacts.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const clients = clientIds.length
    ? await client
        .from("clients")
        .select("id, first_name, last_name, email")
        .in("id", clientIds)
    : { data: [], error: null };

  if (clients.error) throw clients.error;

  const linkByEvent = new Map(links.data.map((link) => [link.event_id, link]));
  const contactByEvent = new Map(
    contacts.data.map((contact) => [contact.event_id, contact.client_id]),
  );
  const clientById = new Map(clients.data.map((item) => [item.id, item]));

  return events.data.flatMap((event) => {
    const link = linkByEvent.get(event.id);
    if (!link) return [];

    const clientId = contactByEvent.get(event.id) ?? "";
    const eventClient = clientById.get(clientId);

    return [{
      bookingStatus: event.booking_status as BookingStatus,
      bookingType: event.booking_type as BookingType,
      clientEmail: eventClient?.email ?? "",
      clientId,
      clientName: eventClient
        ? `${eventClient.first_name} ${eventClient.last_name}`.trim()
        : "",
      commissionEligible: link.commission_eligible,
      commissionPercentageOverride: link.commission_percentage_override,
      eventDate: event.event_date,
      eventId: event.id,
      eventPlannerId: link.id,
      eventType: event.event_type as EventType,
      guestCount: event.guest_count,
      role: link.role,
      venueName: event.venue_name,
    }];
  });
}
