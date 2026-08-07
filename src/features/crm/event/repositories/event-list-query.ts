import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { BookingType } from "../../client/types/client";
import type {
  BookingStatus,
  EventType,
} from "../../shared/types/crm-options";
import type { EventListItem } from "../types/event";

type Client = Pick<
  Database["public"]["Tables"]["clients"]["Row"],
  "email" | "first_name" | "id" | "last_name" | "phone"
>;

const fullName = (client?: Client) => {
  return client ? `${client.first_name} ${client.last_name}`.trim() : "";
};

export async function listEvents(
  database: SupabaseClient<Database>,
): Promise<EventListItem[]> {
  const events = await database
    .from("events")
    .select("*")
    .eq("booking_status", "confirmed")
    .order("event_date", { ascending: true });

  if (events.error) throw events.error;
  if (!events.data.length) return [];

  const eventIds = events.data.map((event) => event.id);
  const [contacts, services, plannerLinks] = await Promise.all([
    database.from("event_contacts").select("*").in("event_id", eventIds),
    database.from("event_services").select("*").in("event_id", eventIds),
    database.from("event_planners").select("*").in("event_id", eventIds),
  ]);

  if (contacts.error) throw contacts.error;
  if (services.error) throw services.error;
  if (plannerLinks.error) throw plannerLinks.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const plannerIds = plannerLinks.data.map((link) => link.planner_id);
  const [clients, planners] = await Promise.all([
    clientIds.length
      ? database.from("clients").select("id, first_name, last_name, email, phone").in("id", clientIds)
      : { data: [], error: null },
    plannerIds.length
      ? database.from("planners").select("id, name").in("id", plannerIds)
      : { data: [], error: null },
  ]);

  if (clients.error) throw clients.error;
  if (planners.error) throw planners.error;

  const clientsById = new Map(clients.data.map((client) => [client.id, client]));
  const plannersById = new Map(planners.data.map((planner) => [planner.id, planner]));

  return events.data.map((event) => {
    const eventContacts = contacts.data.filter((contact) => contact.event_id === event.id);
    const primary = eventContacts.find((contact) => contact.is_primary) ?? eventContacts[0];
    const primaryClient = primary ? clientsById.get(primary.client_id) : undefined;

    return {
      bookingStatus: event.booking_status as BookingStatus,
      bookingType: event.booking_type as BookingType,
      clientId: primaryClient?.id ?? "",
      clientName: fullName(primaryClient),
      eventDate: event.event_date,
      eventId: event.id,
      eventType: event.event_type as EventType,
      guestCount: event.guest_count,
      plannerNames: plannerLinks.data
        .filter((link) => link.event_id === event.id)
        .map((link) => plannersById.get(link.planner_id)?.name ?? "")
        .filter(Boolean),
      serviceIds: services.data
        .filter((service) => service.event_id === event.id)
        .map((service) => service.service_id),
      serviceStartTime: event.service_start_time,
      venueName: event.venue_name,
    };
  });
}
