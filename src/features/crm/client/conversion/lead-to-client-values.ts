import { initialClientFormValues } from "../schemas/client-schema";
import type { ClientFormValues } from "../types/client";
import type { Lead } from "../../lead/types/lead";

export function leadToClientValues(lead: Lead): ClientFormValues {
  const nameParts = lead.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() ?? "";

  return {
    ...initialClientFormValues,
    email: lead.email,
    eventDate: lead.eventDate,
    eventType: lead.eventType,
    firstName,
    guestCount: lead.guestCount,
    lastName: nameParts.join(" "),
    leadSource: lead.leadSource,
    notes: lead.notes,
    phone: lead.phone,
    role: lead.role,
    serviceIds: lead.serviceIds,
    venueId: lead.venueId || (lead.venueName ? "custom" : ""),
    venueName: lead.venueName,
  };
}
