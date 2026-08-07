import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import {
  readInteger,
  readString,
  readTime,
  type EventRow,
  type IncludesField,
  type QuestionnaireResponseRecord,
} from "./questionnaire-apply-utils";

export const applyEventAndVenueData = async (
  database: SupabaseClient<Database>,
  event: EventRow,
  eventId: string,
  eventResponse: QuestionnaireResponseRecord,
  venueResponse: QuestionnaireResponseRecord,
  additionalResponse: QuestionnaireResponseRecord,
  assignedContact: QuestionnaireResponseRecord,
  includesField: IncludesField,
) => {
  const eventUpdate = {
    client_operational_notes: includesField("additional.operationalNotes")
      ? readString(additionalResponse.operationalNotes) || event.client_operational_notes
      : event.client_operational_notes,
    event_hashtags: includesField("event.eventHashtags")
      ? readString(eventResponse.eventHashtags) || event.event_hashtags
      : event.event_hashtags,
    event_name: includesField("event.eventName")
      ? readString(eventResponse.eventName) || event.event_name
      : event.event_name,
    marquee_sign_names: includesField("event.marqueeNames")
      ? readString(eventResponse.marqueeNames) || event.marquee_sign_names
      : event.marquee_sign_names,
    power_supply_access: includesField("venue.powerSupplyAccess")
      && ["yes", "no", "not_sure"].includes(readString(venueResponse.powerSupplyAccess))
      ? readString(venueResponse.powerSupplyAccess)
      : event.power_supply_access,
    power_supply_notes: includesField("venue.powerSupplyNotes")
      ? readString(venueResponse.powerSupplyNotes) || event.power_supply_notes
      : event.power_supply_notes,
    service_end_time: includesField("event.serviceEndTime")
      ? readTime(readString(eventResponse.serviceEndTime), event.service_end_time)
      : event.service_end_time,
    service_location_description: includesField("event.serviceLocationDescription")
      ? readString(eventResponse.serviceLocationDescription) || event.service_location_description
      : event.service_location_description,
    service_start_time: includesField("event.serviceStartTime")
      ? readTime(readString(eventResponse.serviceStartTime), event.service_start_time)
      : event.service_start_time,
    special_requests: includesField("additional.specialRequests")
      ? readString(additionalResponse.specialRequests) || event.special_requests
      : event.special_requests,
    guest_count: includesField("event.guestCount")
      ? readInteger(eventResponse.guestCount) ?? event.guest_count
      : event.guest_count,
  };

  const eventUpdateResult = await database
    .from("events")
    .update(eventUpdate)
    .eq("id", eventId);

  if (eventUpdateResult.error) throw eventUpdateResult.error;

  const assignedContactName = readString(assignedContact.name);
  const shouldApplyAssignedContact = [
    "venue.assignedContact.name",
    "venue.assignedContact.role",
    "venue.assignedContact.phone",
    "venue.assignedContact.email",
  ].some(includesField);

  if (!shouldApplyAssignedContact || !assignedContactName) return;

  const venueContactResult = await database
    .from("event_venue_contacts")
    .insert({
      email: readString(assignedContact.email),
      event_id: eventId,
      name: assignedContactName,
      notes: "Created from approved booking questionnaire.",
      phone: readString(assignedContact.phone),
      role: readString(assignedContact.role),
    })
    .select("id")
    .single();

  if (venueContactResult.error) throw venueContactResult.error;

  const updateContactResult = await database
    .from("events")
    .update({ assigned_event_venue_contact_id: venueContactResult.data.id })
    .eq("id", eventId);

  if (updateContactResult.error) throw updateContactResult.error;
};
