import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

export type EventNotesUpdateValues = {
  internalIssueNotes?: string;
  notes?: string;
  operationsNotes?: string;
};

export type EventOverviewUpdateValues = {
  bookingStatus: string;
  bookingType: string;
  eventDate: string;
  guestCount: number;
  serviceStartTime: string | null;
};

export async function updateEventDetails(
  database: SupabaseClient<Database>,
  id: string,
  values: EventNotesUpdateValues,
) {
  const result = await database
    .from("events")
    .update({
      internal_issue_notes: values.internalIssueNotes ?? "",
      notes: values.notes ?? "",
      operations_notes: values.operationsNotes ?? "",
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data;
}

export async function updateEventOverview(
  database: SupabaseClient<Database>,
  id: string,
  values: EventOverviewUpdateValues,
) {
  const result = await database
    .from("events")
    .update({
      booking_status: values.bookingStatus,
      booking_type: values.bookingType,
      event_date: values.eventDate,
      guest_count: values.guestCount,
      service_start_time: values.serviceStartTime,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data;
}
