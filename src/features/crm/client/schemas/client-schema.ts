import type { TranslationKey } from "@/core/i18n";

import {
  contactRoleOptions,
  eventTypeOptions,
  leadSourceOptions,
} from "../../shared/constants/crm-options";
import { serviceIds } from "../../shared/constants/service-options";
import {
  bookingStatusOptions,
  bookingTypeOptions,
} from "../constants/client-options";
import type { ClientFormValues } from "../types/client";

export type ClientFormErrors = Partial<
  Record<keyof ClientFormValues, TranslationKey>
>;

export const initialClientFormValues: ClientFormValues = {
  bookingStatus: "quote_requested",
  bookingType: "",
  city: "",
  companyName: "",
  country: "",
  email: "",
  eventDate: "",
  eventVenueContactId: "",
  eventType: "wedding",
  facebook: "",
  firstName: "",
  guestCount: "",
  instagram: "",
  lastName: "",
  leadSource: "",
  internalIssueNotes: "",
  notes: "",
  operationsNotes: "",
  paymentPartnerVenueId: "",
  phone: "",
  postalCode: "",
  role: "",
  serviceIds: [],
  serviceEndTime: "",
  serviceStartTime: "",
  stateProvince: "",
  streetAddress: "",
  venueId: "",
  venueDraft: null,
  venueName: "",
  venueSubLocationId: "",
  venueSubLocationOther: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const hasValue = <TValue extends string>(
  options: { value: TValue }[],
  value: string,
) => options.some((option) => option.value === value);

export function validateClientForm(values: ClientFormValues) {
  const errors: ClientFormErrors = {};
  const selectedServices = new Set(values.serviceIds);

  if (!values.firstName.trim()) errors.firstName = "crm.client.validation.required";
  if (!values.lastName.trim()) errors.lastName = "crm.client.validation.required";
  if (!values.email.trim()) errors.email = "crm.client.validation.required";
  if (values.email && !emailPattern.test(values.email)) {
    errors.email = "crm.client.validation.email";
  }
  if (!values.phone.trim()) errors.phone = "crm.client.validation.required";
  if (!values.role) errors.role = "crm.client.validation.required";
  if (values.role && !hasValue(contactRoleOptions, values.role)) {
    errors.role = "crm.client.validation.invalidSelection";
  }
  if (!values.bookingType) errors.bookingType = "crm.client.validation.required";
  if (values.bookingType && !hasValue(bookingTypeOptions, values.bookingType)) {
    errors.bookingType = "crm.client.validation.invalidSelection";
  }
  if (values.bookingType === "preferred_vendor" && !values.paymentPartnerVenueId) {
    errors.paymentPartnerVenueId = "crm.client.validation.required";
  }
  if (values.paymentPartnerVenueId && !uuidPattern.test(values.paymentPartnerVenueId)) {
    errors.paymentPartnerVenueId = "crm.client.validation.invalidSelection";
  }
  if (values.venueId && values.venueId !== "custom" && !uuidPattern.test(values.venueId)) {
    errors.venueId = "crm.client.validation.invalidSelection";
  }
  if (
    values.venueSubLocationId &&
    values.venueSubLocationId !== "custom" &&
    !uuidPattern.test(values.venueSubLocationId)
  ) {
    errors.venueSubLocationId = "crm.client.validation.invalidSelection";
  }
  if (values.eventVenueContactId && !uuidPattern.test(values.eventVenueContactId)) {
    errors.eventVenueContactId = "crm.client.validation.invalidSelection";
  }
  if (!values.leadSource) errors.leadSource = "crm.client.validation.required";
  if (values.leadSource && !hasValue(leadSourceOptions, values.leadSource)) {
    errors.leadSource = "crm.client.validation.invalidSelection";
  }
  if (!values.eventType) errors.eventType = "crm.client.validation.required";
  if (values.eventType && !hasValue(eventTypeOptions, values.eventType)) {
    errors.eventType = "crm.client.validation.invalidSelection";
  }
  if (!values.eventDate) errors.eventDate = "crm.client.validation.required";
  if (!values.serviceStartTime) {
    errors.serviceStartTime = "crm.client.validation.required";
  }
  if (!/^\d+$/.test(values.guestCount) || Number(values.guestCount) < 1) {
    errors.guestCount = "crm.client.validation.positiveInteger";
  }
  if (!hasValue(bookingStatusOptions, values.bookingStatus)) {
    errors.bookingStatus = "crm.client.validation.invalidSelection";
  }
  if (values.serviceIds.some((id) => !serviceIds.includes(id))) {
    errors.serviceIds = "crm.client.validation.invalidSelection";
  }
  if (selectedServices.size !== values.serviceIds.length) {
    errors.serviceIds = "crm.client.validation.duplicateSelection";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
