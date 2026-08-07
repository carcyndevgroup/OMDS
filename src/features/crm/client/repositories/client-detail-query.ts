import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  BookingStatus,
  ContactRole,
  EventType,
  LeadSource,
} from "../../shared/types/crm-options";
import { getCancunDate } from "../../shared/utils/cancun-date";
import type { BookingType, ClientDetail } from "../types/client";

type DbClient = Database["public"]["Tables"]["clients"]["Row"];
type DbEvent = Database["public"]["Tables"]["events"]["Row"];

const toClient = (row: DbClient) => ({
  city: row.city,
  companyName: row.company_name,
  country: row.country,
  createdAt: row.created_at,
  email: row.email,
  facebook: row.facebook,
  firstName: row.first_name,
  id: row.id,
  instagram: row.instagram,
  lastName: row.last_name,
  leadSource: row.lead_source as LeadSource,
  legalFirstName: row.legal_first_name,
  legalLastName: row.legal_last_name,
  phone: row.phone,
  postalCode: row.postal_code,
  preferredCommunicationMethod: row.preferred_communication_method,
  stateProvince: row.state_province,
  streetAddress: row.street_address,
  updatedAt: row.updated_at,
});

const selectCurrentEvent = (events: DbEvent[]) => {
  const today = getCancunDate();
  return events.find((event) => event.event_date >= today) ?? events[events.length - 1];
};

export async function findClientDetail(
  database: SupabaseClient<Database>,
  id: string,
): Promise<ClientDetail | null> {
  const clientResult = await database
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (clientResult.error) throw clientResult.error;
  if (!clientResult.data) return null;

  const clientContacts = await database
    .from("event_contacts")
    .select("event_id")
    .eq("client_id", id);

  if (clientContacts.error) throw clientContacts.error;
  if (clientContacts.data.length === 0) {
    return { ...toClient(clientResult.data), event: null };
  }

  const eventsResult = await database
    .from("events")
    .select("*")
    .in(
      "id",
      clientContacts.data.map((contact) => contact.event_id),
    )
    .order("event_date", { ascending: true });

  if (eventsResult.error) throw eventsResult.error;
  const event = selectCurrentEvent(eventsResult.data);
  if (!event) return { ...toClient(clientResult.data), event: null };

  const [contactsResult, servicesResult] = await Promise.all([
    database.from("event_contacts").select("*").eq("event_id", event.id),
    database.from("event_services").select("service_id").eq("event_id", event.id),
  ]);

  if (contactsResult.error) throw contactsResult.error;
  if (servicesResult.error) throw servicesResult.error;

  const contactIds = contactsResult.data.map((contact) => contact.client_id);
  const eventClientResult = await database
    .from("clients")
    .select("id, first_name, last_name, email, phone")
    .in("id", contactIds);

  if (eventClientResult.error) throw eventClientResult.error;
  const contactById = new Map(
    eventClientResult.data.map((contact) => [contact.id, contact]),
  );
  const venueIds = [event.venue_id, event.payment_partner_venue_id].filter(
    (venueId): venueId is string => Boolean(venueId),
  );
  const assignedVenueContactId =
    event.assigned_event_venue_contact_id ?? event.event_venue_contact_id;
  const [venuesResult, subLocationResult, assignedContactResult, venueContactResult] = await Promise.all([
    venueIds.length
      ? database
          .from("venues")
          .select("id, name, distance_from_hq_km, uses_sub_locations")
          .in("id", venueIds)
      : { data: [], error: null },
    event.venue_sub_location_id
      ? database
          .from("venue_sub_locations")
          .select("id, name")
          .eq("id", event.venue_sub_location_id)
          .maybeSingle()
      : { data: null, error: null },
    event.assigned_event_venue_contact_id
      ? database
          .from("event_venue_contacts")
          .select("id, name, phone, role")
          .eq("id", event.assigned_event_venue_contact_id)
          .maybeSingle()
      : { data: null, error: null },
    event.event_venue_contact_id
      ? database
          .from("venue_contacts")
          .select("id, name, phone, role")
          .eq("id", event.event_venue_contact_id)
          .maybeSingle()
      : { data: null, error: null },
  ]);

  if (venuesResult.error) throw venuesResult.error;
  if (subLocationResult.error) throw subLocationResult.error;
  if (assignedContactResult.error) throw assignedContactResult.error;
  if (venueContactResult.error) throw venueContactResult.error;
  const venueContact = assignedContactResult.data ?? venueContactResult.data;
  const venueById = new Map(
    venuesResult.data.map((venue) => [venue.id, venue]),
  );

  return {
    ...toClient(clientResult.data),
    event: {
      bookingStatus: event.booking_status as BookingStatus,
      bookingType: event.booking_type as BookingType,
      contacts: contactsResult.data.flatMap((contact) => {
        const person = contactById.get(contact.client_id);
        return person
          ? [{
              clientId: person.id,
              email: person.email,
              firstName: person.first_name,
              isPrimary: contact.is_primary,
              lastName: person.last_name,
              phone: person.phone,
              role: contact.role as ContactRole,
            }]
          : [];
      }),
      createdAt: event.created_at,
      eventDate: event.event_date,
      eventHashtags: event.event_hashtags,
      eventName: event.event_name,
      eventVenueContactId: assignedVenueContactId,
      eventVenueContactName: venueContact?.name ?? "",
      eventVenueContactPhone: venueContact?.phone ?? "",
      eventVenueContactRole: venueContact?.role ?? "",
      eventType: event.event_type as EventType,
      guestCount: event.guest_count,
      id: event.id,
      clientOperationalNotes: event.client_operational_notes,
      internalIssueNotes: event.internal_issue_notes,
      marqueeSignNames: event.marquee_sign_names,
      notes: event.notes,
      operationsNotes: event.operations_notes,
      paymentPartnerName: event.payment_partner_venue_id
        ? venueById.get(event.payment_partner_venue_id)?.name ?? ""
        : "",
      paymentPartnerVenueId: event.payment_partner_venue_id,
      powerSupplyAccess: event.power_supply_access,
      powerSupplyNotes: event.power_supply_notes,
      serviceEndTime: event.service_end_time,
      serviceIds: servicesResult.data.map((service) => service.service_id),
      serviceLocationDescription: event.service_location_description,
      serviceStartTime: event.service_start_time,
      sourceLeadId: event.source_lead_id,
      specialRequests: event.special_requests,
      updatedAt: event.updated_at,
      venueId: event.venue_id,
      venueDistanceFromHqKm: event.venue_id
        ? venueById.get(event.venue_id)?.distance_from_hq_km ?? null
        : null,
      venueName: event.venue_id
        ? venueById.get(event.venue_id)?.name ?? event.venue_name
        : event.venue_name,
      venueUsesSubLocations: event.venue_id
        ? venueById.get(event.venue_id)?.uses_sub_locations ?? false
        : false,
      venueSubLocationId: event.venue_sub_location_id,
      venueSubLocationName: subLocationResult.data?.name ?? "",
      venueSubLocationOther: event.venue_sub_location_other,
    },
  };
}
