import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  DashboardMonthEvent,
  DashboardSummary,
  PendingQuestionnaireReview,
  UpcomingDashboardEvent,
} from "../types/dashboard";
import { hydrateDashboardEvents } from "./dashboard-event-hydration";

type PendingEventRow = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "event_date" | "id" | "venue_name"
>;

type ClientRow = Pick<
  Database["public"]["Tables"]["clients"]["Row"],
  "first_name" | "id" | "last_name"
>;

const nameOf = (client?: ClientRow) => {
  return client ? `${client.first_name} ${client.last_name}`.trim() : "";
};

export async function listPendingQuestionnaireReviews(
  database: SupabaseClient<Database>,
): Promise<PendingQuestionnaireReview[]> {
  const questionnaires = await database
    .from("questionnaires")
    .select("id, event_id, submitted_at, title")
    .eq("status", "submitted")
    .eq("review_status", "pending_review")
    .order("submitted_at", { ascending: true });

  if (questionnaires.error) throw questionnaires.error;
  if (!questionnaires.data.length) return [];

  const eventIds = questionnaires.data.map((item) => item.event_id);
  const [events, contacts] = await Promise.all([
    database
      .from("events")
      .select("id, event_date, venue_name")
      .in("id", eventIds),
    database
      .from("event_contacts")
      .select("event_id, client_id")
      .eq("is_primary", true)
      .in("event_id", eventIds),
  ]);

  if (events.error) throw events.error;
  if (contacts.error) throw contacts.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const clients = clientIds.length
    ? await database
        .from("clients")
        .select("id, first_name, last_name")
        .in("id", clientIds)
    : { data: [], error: null };

  if (clients.error) throw clients.error;

  const eventById = new Map(events.data.map((event) => [event.id, event]));
  const contactByEvent = new Map(
    contacts.data.map((contact) => [contact.event_id, contact.client_id]),
  );
  const clientById = new Map(clients.data.map((client) => [client.id, client]));

  return questionnaires.data.map((questionnaire) => {
    const event = eventById.get(questionnaire.event_id) as PendingEventRow | undefined;
    const clientId = contactByEvent.get(questionnaire.event_id) ?? "";
    const client = clientById.get(clientId);

    return {
      clientId,
      clientName: nameOf(client),
      eventDate: event?.event_date ?? "",
      eventId: questionnaire.event_id,
      questionnaireId: questionnaire.id,
      submittedAt: questionnaire.submitted_at,
      title: questionnaire.title,
      venueName: event?.venue_name ?? "",
    };
  });
}

export async function getDashboardSummary(
  database: SupabaseClient<Database>,
): Promise<DashboardSummary> {
  const [leads, bookings, events, questionnaires] = await Promise.all([
    countRows(
      database
        .from("leads")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "contacted", "waiting_on_lead"]),
    ),
    countRows(
      database
        .from("events")
        .select("id", { count: "exact", head: true })
        .in("booking_status", [
          "quote_requested",
          "proposal_sent",
          "tentative_hold",
        ]),
    ),
    countRows(
      database
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("booking_status", "confirmed"),
    ),
    countRows(
      database
        .from("questionnaires")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted")
        .eq("review_status", "pending_review"),
    ),
  ]);

  return {
    activeBookings: bookings,
    activeLeads: leads,
    confirmedEvents: events,
    pendingQuestionnaires: questionnaires,
  };
}

async function countRows(
  query: PromiseLike<{ count: number | null; error: unknown }>,
) {
  const result = await query;
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export async function listUpcomingDashboardEvents(
  database: SupabaseClient<Database>,
): Promise<UpcomingDashboardEvent[]> {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Cancun",
  });
  const events = await database
    .from("events")
    .select("id, booking_status, event_date, guest_count, service_start_time, venue_name")
    .eq("booking_status", "confirmed")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5);

  if (events.error) throw events.error;
  if (!events.data.length) return [];

  return hydrateDashboardEvents(database, events.data);
}

export async function listDashboardMonthEvents(
  database: SupabaseClient<Database>,
  month: string,
  includeUnconfirmed = false,
): Promise<DashboardMonthEvent[]> {
  const startDate = `${month}-01`;
  const endDate = getNextMonthStart(month);
  let query = database
    .from("events")
    .select("id, booking_status, event_date, guest_count, service_start_time, venue_name")
    .gte("event_date", startDate)
    .lt("event_date", endDate)
    .order("event_date", { ascending: true });

  query = includeUnconfirmed
    ? query.in("booking_status", [
        "quote_requested",
        "proposal_sent",
        "tentative_hold",
        "confirmed",
      ])
    : query.eq("booking_status", "confirmed");

  const events = await query;

  if (events.error) throw events.error;
  if (!events.data.length) return [];

  return hydrateDashboardEvents(database, events.data);
}

function getNextMonthStart(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber, 1));
  return date.toISOString().slice(0, 10);
}
