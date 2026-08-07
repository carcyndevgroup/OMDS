import { initialClientFormValues } from "../schemas/client-schema";
import type { ClientDetail, ClientFormValues } from "../types/client";

export function clientDetailToFormValues(
  client: ClientDetail,
): ClientFormValues | null {
  const event = client.event;
  if (!event) return null;

  const contact = event.contacts.find((item) => item.clientId === client.id);

  return {
    ...initialClientFormValues,
    bookingStatus: event.bookingStatus,
    bookingType: event.bookingType,
    city: client.city,
    companyName: client.companyName,
    country: client.country,
    email: client.email,
    eventDate: event.eventDate,
    eventVenueContactId: event.eventVenueContactId ?? "",
    eventType: event.eventType,
    facebook: client.facebook,
    firstName: client.firstName,
    guestCount: String(event.guestCount),
    instagram: client.instagram,
    lastName: client.lastName,
    leadSource: client.leadSource,
    internalIssueNotes: event.internalIssueNotes,
    notes: event.notes,
    operationsNotes: event.operationsNotes,
    paymentPartnerVenueId: event.paymentPartnerVenueId ?? "",
    phone: client.phone,
    postalCode: client.postalCode,
    role: contact?.role ?? "",
    serviceIds: event.serviceIds,
    serviceEndTime: event.serviceEndTime ?? "",
    serviceStartTime: event.serviceStartTime ?? "",
    stateProvince: client.stateProvince,
    streetAddress: client.streetAddress,
    venueId: event.venueId ?? (event.venueName ? "custom" : ""),
    venueName: event.venueName,
    venueSubLocationId: event.venueSubLocationId ?? (
      event.venueSubLocationOther ? "custom" : ""
    ),
    venueSubLocationOther: event.venueSubLocationOther,
  };
}
