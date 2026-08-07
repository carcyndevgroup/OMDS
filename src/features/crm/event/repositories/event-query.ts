import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { BookingType } from "../../client/types/client";
import { mapEventEquipmentAssignments } from "../../equipment/repositories/event-equipment-repository";
import { listEventFiles } from "../../files/repositories/event-file-repository";
import type {
  BookingStatus,
  EventType,
} from "../../shared/types/crm-options";
import type {
  EventDetail,
  EventPlannerSummary,
  EventVenueContactSummary,
} from "../types/event";
import { mapContacts, mapStaffAssignments } from "./event-query-mappers";

export async function findEventDetail(
  database: SupabaseClient<Database>,
  id: string,
): Promise<EventDetail | null> {
  const event = await database.from("events").select("*").eq("id", id).maybeSingle();

  if (event.error) throw event.error;
  if (!event.data) return null;

  const [contacts, services, plannerLinks, equipmentAssignments, filesToInclude, venueContacts] = await Promise.all([
    database.from("event_contacts").select("*").eq("event_id", id),
    database.from("event_services").select("*").eq("event_id", id),
    database.from("event_planners").select("*").eq("event_id", id),
    database.from("event_equipment_assignments").select("*").eq("event_id", id),
    listEventFiles(database, id, true),
    database.from("event_venue_contacts").select("id, name, phone, role, email").eq("event_id", id),
  ]);

  if (contacts.error) throw contacts.error;
  if (services.error) throw services.error;
  if (plannerLinks.error) throw plannerLinks.error;
  if (equipmentAssignments.error) throw equipmentAssignments.error;
  if (venueContacts.error) throw venueContacts.error;

  const clientIds = contacts.data.map((contact) => contact.client_id);
  const plannerIds = plannerLinks.data.map((link) => link.planner_id);
  const equipmentIds = equipmentAssignments.data.map((item) => item.equipment_id);
  const venueIds = [event.data.venue_id, event.data.payment_partner_venue_id].filter(
    (venueId): venueId is string => Boolean(venueId),
  );
  const staffAssignments = await database
    .from("event_staff_assignments")
    .select("*")
    .eq("event_id", id);

  if (staffAssignments.error) throw staffAssignments.error;

  const staffIds = staffAssignments.data.map((assignment) => assignment.staff_member_id);
  const [clients, planners, venues, staff, equipment] = await Promise.all([
    clientIds.length
      ? database.from("clients").select("id, first_name, last_name, email, phone").in("id", clientIds)
      : { data: [], error: null },
    plannerIds.length
      ? database.from("planners").select("id, name, phone").in("id", plannerIds)
      : { data: [], error: null },
    venueIds.length
      ? database
          .from("venues")
          .select("id, name, area, street_address, city, state_province, postal_code, country, notes, travel_time_minutes, uses_sub_locations, requires_sat_fiscal, invoice_behavior, factura_recipient")
          .in("id", venueIds)
      : { data: [], error: null },
    staffIds.length
      ? database
          .from("staff_members")
          .select("id, display_name, name, phone")
          .in("id", staffIds)
      : { data: [], error: null },
    equipmentIds.length
      ? database
          .from("equipment_catalog")
          .select("id, name, category")
          .in("id", equipmentIds)
      : { data: [], error: null },
  ]);

  if (clients.error) throw clients.error;
  if (planners.error) throw planners.error;
  if (venues.error) throw venues.error;
  if (staff.error) throw staff.error;
  if (equipment.error) throw equipment.error;

  const clientsById = new Map(clients.data.map((client) => [client.id, client]));
  const plannersById = new Map(planners.data.map((planner) => [planner.id, planner]));
  const venuesById = new Map(venues.data.map((venue) => [venue.id, venue]));
  const staffById = new Map(staff.data.map((member) => [member.id, member]));
  const equipmentById = new Map(equipment.data.map((item) => [item.id, item]));
  const assignedVenueContactId =
    event.data.assigned_event_venue_contact_id ?? event.data.event_venue_contact_id;
  const [subLocation, assignedContact, venueContact] = await Promise.all([
    event.data.venue_sub_location_id
      ? database
          .from("venue_sub_locations")
          .select("id, name")
          .eq("id", event.data.venue_sub_location_id)
          .maybeSingle()
      : { data: null, error: null },
    event.data.assigned_event_venue_contact_id
      ? database
          .from("event_venue_contacts")
          .select("id, name, phone, role")
          .eq("id", event.data.assigned_event_venue_contact_id)
          .maybeSingle()
      : { data: null, error: null },
    event.data.event_venue_contact_id
      ? database
          .from("venue_contacts")
          .select("id, name, phone, role")
          .eq("id", event.data.event_venue_contact_id)
          .maybeSingle()
      : { data: null, error: null },
  ]);

  if (subLocation.error) throw subLocation.error;
  if (assignedContact.error) throw assignedContact.error;
  if (venueContact.error) throw venueContact.error;
  const eventVenueContact = assignedContact.data ?? venueContact.data;

  const eventVenue = event.data.venue_id
    ? venuesById.get(event.data.venue_id)
    : undefined;
  const mappedContacts = mapContacts(contacts.data, clientsById);
  const primary = mappedContacts.find((contact) => contact.isPrimary) ?? mappedContacts[0];
  const secondaryContacts: EventVenueContactSummary[] = venueContacts.data
    .filter((contact) => contact.id !== assignedVenueContactId)
    .map((contact) => ({
      email: contact.email,
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      role: contact.role,
    }));
  const mappedPlanners: EventPlannerSummary[] = plannerLinks.data.map((link) => ({
    commissionEligible: link.commission_eligible,
    id: link.id,
    name: plannersById.get(link.planner_id)?.name ?? "",
    phone: plannersById.get(link.planner_id)?.phone ?? "",
    plannerId: link.planner_id,
    role: link.role,
  }));
  const mappedStaff = mapStaffAssignments(staffAssignments.data, staffById);

  return {
    bookingStatus: event.data.booking_status as BookingStatus,
    bookingType: event.data.booking_type as BookingType,
    arrivalBufferMinutes: event.data.arrival_buffer_minutes,
    clientOperationalNotes: event.data.client_operational_notes,
    clientId: primary?.clientId ?? "",
    clientName: primary?.name ?? "",
    contacts: mappedContacts,
    createdAt: event.data.created_at,
    departureBufferMinutes: event.data.departure_buffer_minutes,
    eventDate: event.data.event_date,
    eventId: event.data.id,
    eventHashtags: event.data.event_hashtags,
    eventName: event.data.event_name,
    eventVenueContactId: assignedVenueContactId,
    eventVenueContactName: eventVenueContact?.name ?? "",
    eventVenueContactPhone: eventVenueContact?.phone ?? "",
    eventVenueContactRole: eventVenueContact?.role ?? "",
    eventType: event.data.event_type as EventType,
    filesToInclude,
    guestCount: event.data.guest_count,
    internalIssueNotes: event.data.internal_issue_notes,
    loadBeforeDepartureMinutes: event.data.load_before_departure_minutes,
    marqueeSignNames: event.data.marquee_sign_names,
    notes: event.data.notes,
    operationsNotes: event.data.operations_notes,
    packUpMinutes: event.data.pack_up_minutes,
    secondaryContacts,
    paymentPartnerName: event.data.payment_partner_venue_id
      ? venuesById.get(event.data.payment_partner_venue_id)?.name ?? ""
      : "",
    facturaRecipient: eventVenue?.factura_recipient ?? "",
    plannerNames: mappedPlanners.map((planner) => planner.name).filter(Boolean),
    planners: mappedPlanners,
    powerSupplyAccess: event.data.power_supply_access,
    powerSupplyNotes: event.data.power_supply_notes,
    serviceDurationMinutes: event.data.service_duration_minutes,
    serviceIds: services.data.map((service) => service.service_id),
    serviceEndTime: event.data.service_end_time,
    serviceLocationDescription: event.data.service_location_description,
    serviceStartTime: event.data.service_start_time,
    setupDurationMinutes: event.data.setup_duration_minutes,
    specialRequests: event.data.special_requests,
    equipmentAssignments: mapEventEquipmentAssignments(
      equipmentAssignments.data,
      equipmentById,
    ),
    staffAssignments: mappedStaff,
    travelTimeMinutes: event.data.venue_id
      ? venuesById.get(event.data.venue_id)?.travel_time_minutes ?? null
      : null,
    updatedAt: event.data.updated_at,
    unloadAfterReturnMinutes: event.data.unload_after_return_minutes,
    venueAddress: [
      eventVenue?.street_address,
      eventVenue?.city,
      eventVenue?.state_province,
      eventVenue?.postal_code,
      eventVenue?.country,
    ].filter(Boolean).join(", "),
    venueArea: eventVenue?.area ?? "",
    venueId: event.data.venue_id,
    venueInvoiceBehavior: eventVenue?.invoice_behavior ?? "",
    venueNotes: eventVenue?.notes ?? "",
    venueRequiresSatFiscal: eventVenue?.requires_sat_fiscal ?? false,
    venueName: event.data.venue_id
      ? venuesById.get(event.data.venue_id)?.name ?? event.data.venue_name
      : event.data.venue_name,
    venueSubLocationId: event.data.venue_sub_location_id,
    venueSubLocationName: subLocation.data?.name ?? "",
    venueSubLocationOther: event.data.venue_sub_location_other,
    venueUsesSubLocations: eventVenue?.uses_sub_locations ?? false,
  };
}
