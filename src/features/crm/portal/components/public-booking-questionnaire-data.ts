import type { Json } from "@/core/supabase/json.types";

export type AdditionalClient = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
};

export type SecondaryContact = {
  email: string;
  name: string;
  phone: string;
  role: string;
};

export type PlannerPrefix = "coordinator" | "planner";

export type FormValues = {
  additionalClients: AdditionalClient[];
  secondaryContacts: SecondaryContact[];
  clientAddress: string;
  clientRole: string;
  coordinatorCompany: string;
  coordinatorEmail: string;
  coordinatorFacebook: string;
  coordinatorFirstName: string;
  coordinatorInstagram: string;
  coordinatorLastName: string;
  coordinatorPhone: string;
  coordinatorPrimaryContact: string;
  eventHashtags: string;
  eventName: string;
  guestCount: string;
  facebook: string;
  instagram: string;
  legalFirstName: string;
  legalLastName: string;
  marqueeNames: string;
  operationalNotes: string;
  phone: string;
  plannerCompany: string;
  plannerEmail: string;
  plannerFacebook: string;
  plannerFirstName: string;
  plannerInstagram: string;
  plannerLastName: string;
  plannerPhone: string;
  plannerPrimaryContact: string;
  powerSupplyAccess: string;
  powerSupplyNotes: string;
  preferredCommunicationMethod: string;
  serviceStartTime: string;
  serviceEndTime: string;
  serviceLocationDescription: string;
  specialRequests: string;
  venueAddress: string;
  venueContactEmail: string;
  venueContactName: string;
  venueContactPhone: string;
  venueContactRole: string;
  venueName: string;
  dynamicResponses: Record<string, Json>;
};

export const emptyClient = (): AdditionalClient => ({
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "",
});

export const emptySecondaryContact = (): SecondaryContact => ({
  email: "",
  name: "",
  phone: "",
  role: "",
});

export const initialValues: FormValues = {
  additionalClients: [],
  secondaryContacts: [],
  clientAddress: "",
  clientRole: "",
  coordinatorCompany: "",
  coordinatorEmail: "",
  coordinatorFacebook: "",
  coordinatorFirstName: "",
  coordinatorInstagram: "",
  coordinatorLastName: "",
  coordinatorPhone: "",
  coordinatorPrimaryContact: "no",
  eventHashtags: "",
  eventName: "",
  guestCount: "",
  facebook: "",
  instagram: "",
  legalFirstName: "",
  legalLastName: "",
  marqueeNames: "",
  operationalNotes: "",
  phone: "",
  plannerCompany: "",
  plannerEmail: "",
  plannerFacebook: "",
  plannerFirstName: "",
  plannerInstagram: "",
  plannerLastName: "",
  plannerPhone: "",
  plannerPrimaryContact: "no",
  powerSupplyAccess: "not_sure",
  powerSupplyNotes: "",
  preferredCommunicationMethod: "email",
  serviceStartTime: "",
  serviceEndTime: "",
  serviceLocationDescription: "",
  specialRequests: "",
  venueAddress: "",
  venueContactEmail: "",
  venueContactName: "",
  venueContactPhone: "",
  venueContactRole: "",
  venueName: "",
  dynamicResponses: {},
};

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const asString = (value: unknown) => {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
};

const additionalClientsFrom = (value: unknown): AdditionalClient[] => {
  return Array.isArray(value)
    ? value.map((item) => {
        const client = asRecord(item);
        return {
          email: asString(client.email),
          firstName: asString(client.firstName),
          lastName: asString(client.lastName),
          phone: asString(client.phone),
          role: asString(client.role),
        };
      })
    : [];
};

const secondaryContactsFrom = (value: unknown): SecondaryContact[] => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      const contact = asRecord(item);
      return {
        email: asString(contact.email),
        name: asString(contact.name),
        phone: asString(contact.phone),
        role: asString(contact.role),
      };
    });
  }

  const parsed = asString(value);
  return parsed ? [{ ...emptySecondaryContact(), name: parsed }] : [];
};

export function formValuesFromResponse(responseData: Json): FormValues {
  const root = asRecord(responseData);
  const additional = asRecord(root.additional);
  const client = asRecord(root.client);
  const coordinator = asRecord(root.dayOfCoordinator);
  const event = asRecord(root.event);
  const planner = asRecord(root.externalPlanner);
  const venue = asRecord(root.venue);
  const venueContact = asRecord(venue.assignedContact);
  const venueName = asString(venue.name);
  const venueAddress = asString(venue.address);
  const dynamicResponsesRaw = asRecord(root.dynamicResponses);
  const dynamicResponses = Object.entries(dynamicResponsesRaw).reduce<Record<string, Json>>((accumulator, [key, current]) => {
    if (current !== undefined) accumulator[key] = current as Json;
    return accumulator;
  }, {});

  return {
    ...initialValues,
    additionalClients: additionalClientsFrom(client.additionalClients),
    secondaryContacts: secondaryContactsFrom(additional.secondaryContacts ?? additional.secondaryContact),
    clientAddress: asString(client.address),
    clientRole: asString(client.role),
    coordinatorCompany: asString(coordinator.company),
    coordinatorEmail: asString(coordinator.email),
    coordinatorFacebook: asString(coordinator.facebook),
    coordinatorFirstName: asString(coordinator.firstName),
    coordinatorInstagram: asString(coordinator.instagram),
    coordinatorLastName: asString(coordinator.lastName),
    coordinatorPhone: asString(coordinator.phone),
    coordinatorPrimaryContact: asString(coordinator.primaryEventContact) || "no",
    eventHashtags: asString(event.eventHashtags),
    eventName: asString(event.eventName),
    guestCount: asString(event.guestCount),
    facebook: asString(client.facebook),
    instagram: asString(client.instagram),
    legalFirstName: asString(client.legalFirstName),
    legalLastName: asString(client.legalLastName),
    marqueeNames: asString(event.marqueeNames),
    operationalNotes: asString(additional.operationalNotes),
    phone: asString(client.phone),
    plannerCompany: asString(planner.company),
    plannerEmail: asString(planner.email),
    plannerFacebook: asString(planner.facebook),
    plannerFirstName: asString(planner.firstName),
    plannerInstagram: asString(planner.instagram),
    plannerLastName: asString(planner.lastName),
    plannerPhone: asString(planner.phone),
    plannerPrimaryContact: asString(planner.primaryEventContact) || "no",
    powerSupplyAccess: asString(venue.powerSupplyAccess) || "not_sure",
    powerSupplyNotes: asString(venue.powerSupplyNotes),
    preferredCommunicationMethod:
      asString(client.preferredCommunicationMethod) || "email",
    serviceEndTime: asString(event.serviceEndTime),
    serviceStartTime: asString(event.serviceStartTime),
    serviceLocationDescription: asString(event.serviceLocationDescription),
    specialRequests: asString(additional.specialRequests),
    venueAddress: venueAddress === venueName ? "" : venueAddress,
    venueContactEmail: asString(venueContact.email),
    venueContactName: asString(venueContact.name),
    venueContactPhone: asString(venueContact.phone),
    venueContactRole: asString(venueContact.role),
    venueName,
    dynamicResponses,
  };
}
