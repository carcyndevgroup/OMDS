import type {
  FormValues,
  PlannerPrefix,
} from "./public-booking-questionnaire-data";
import type { Json } from "@/core/supabase/json.types";

export function buildResponse(values: FormValues) {
  return {
    additional: {
      operationalNotes: values.operationalNotes,
      specialRequests: values.specialRequests,
      secondaryContacts: values.secondaryContacts,
    },
    client: {
      additionalClients: values.additionalClients,
      address: values.clientAddress,
      facebook: values.facebook,
      instagram: values.instagram,
      legalFirstName: values.legalFirstName,
      legalLastName: values.legalLastName,
      role: values.clientRole,
      phone: values.phone,
      preferredCommunicationMethod: values.preferredCommunicationMethod,
    },
    dayOfCoordinator: plannerResponse(values, "coordinator"),
    event: {
      eventHashtags: values.eventHashtags,
      eventName: values.eventName,
      guestCount: values.guestCount,
      marqueeNames: values.marqueeNames,
      serviceEndTime: values.serviceEndTime,
      serviceLocationDescription: values.serviceLocationDescription,
      serviceStartTime: values.serviceStartTime,
    },
    externalPlanner: plannerResponse(values, "planner"),
    venue: {
      address: values.venueAddress,
      assignedContact: {
        email: values.venueContactEmail,
        name: values.venueContactName,
        phone: values.venueContactPhone,
        role: values.venueContactRole,
      },
      name: values.venueName,
      powerSupplyAccess: values.powerSupplyAccess,
      powerSupplyNotes: values.powerSupplyNotes,
    },
    dynamicResponses: values.dynamicResponses,
  };
}

function plannerResponse(values: FormValues, prefix: PlannerPrefix) {
  return {
    company: values[`${prefix}Company` as keyof FormValues] as Json,
    email: values[`${prefix}Email` as keyof FormValues] as Json,
    facebook: values[`${prefix}Facebook` as keyof FormValues] as Json,
    firstName: values[`${prefix}FirstName` as keyof FormValues] as Json,
    instagram: values[`${prefix}Instagram` as keyof FormValues] as Json,
    lastName: values[`${prefix}LastName` as keyof FormValues] as Json,
    phone: values[`${prefix}Phone` as keyof FormValues] as Json,
    primaryEventContact: values[`${prefix}PrimaryContact` as keyof FormValues] as Json,
  };
}
