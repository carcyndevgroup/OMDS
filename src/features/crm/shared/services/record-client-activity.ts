import { createServerSupabaseClient } from "@/core/supabase/server-client";

export async function recordClientEventActivity(
  eventId: string,
  eventType: string,
  summary: string,
) {
  const database = await createServerSupabaseClient();
  const event = await database
    .from("event_contacts")
    .select("client_id")
    .eq("event_id", eventId)
    .eq("is_primary", true)
    .maybeSingle();

  if (event.error || !event.data?.client_id) return;

  await database.rpc("record_crm_activity", {
    target_entity: "clients",
    target_event_type: eventType,
    target_linked_path: `/crm/clients/${event.data.client_id}?tab=overview`,
    target_record_id: event.data.client_id,
    target_summary: summary,
  });
}
