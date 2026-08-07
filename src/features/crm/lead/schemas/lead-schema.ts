import type { TranslationKey } from "@/core/i18n";

import {
  eventTypeOptions,
  leadRoleOptions,
  leadSourceOptions,
  leadStatusOptions,
} from "../constants/lead-options";
import { serviceIds } from "../../shared/constants/service-options";
import type { LeadFormValues } from "../types/lead";

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, TranslationKey>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const initialLeadFormValues: LeadFormValues = {
  name: "",
  email: "",
  phone: "",
  role: "",
  eventType: "wedding",
  eventDate: "",
  guestCount: "",
  venueName: "",
  archivedAt: null,
  venueId: "",
  venueDraft: null,
  serviceIds: [],
  notes: "",
  leadSource: "",
  status: "new",
};

const isPositiveInteger = (value: string) => {
  return /^\d+$/.test(value) && Number(value) > 0;
};

const includesValue = <TValue extends string>(
  values: TValue[],
  value: string,
) => {
  return values.includes(value as TValue);
};

const eventTypes = eventTypeOptions.map((option) => option.value);
const leadRoles = leadRoleOptions.map((option) => option.value);
const leadSources = leadSourceOptions.map((option) => option.value);
const leadStatuses = leadStatusOptions.map((option) => option.value);

export function validateLeadForm(values: LeadFormValues) {
  const errors: LeadFormErrors = {};
  const selectedServices = new Set(values.serviceIds);

  if (!values.name.trim()) errors.name = "crm.lead.validation.required";
  if (!values.email.trim()) errors.email = "crm.lead.validation.required";
  if (values.email && !emailPattern.test(values.email)) {
    errors.email = "crm.lead.validation.email";
  }
  if (!values.phone.trim()) errors.phone = "crm.lead.validation.required";
  if (!values.role) errors.role = "crm.lead.validation.required";
  if (values.role && !includesValue(leadRoles, values.role)) {
    errors.role = "crm.lead.validation.invalidSelection";
  }
  if (!values.eventType) errors.eventType = "crm.lead.validation.required";
  if (values.eventType && !includesValue(eventTypes, values.eventType)) {
    errors.eventType = "crm.lead.validation.invalidSelection";
  }
  if (!values.eventDate) errors.eventDate = "crm.lead.validation.required";
  if (!isPositiveInteger(values.guestCount)) {
    errors.guestCount = "crm.lead.validation.positiveInteger";
  }
  if (!values.leadSource) errors.leadSource = "crm.lead.validation.required";
  if (values.leadSource && !includesValue(leadSources, values.leadSource)) {
    errors.leadSource = "crm.lead.validation.invalidSelection";
  }
  if (!includesValue(leadStatuses, values.status)) {
    errors.status = "crm.lead.validation.invalidSelection";
  }
  if (values.serviceIds.some((serviceId) => !serviceIds.includes(serviceId))) {
    errors.serviceIds = "crm.lead.validation.invalidSelection";
  }
  if (selectedServices.size !== values.serviceIds.length) {
    errors.serviceIds = "crm.lead.validation.duplicateSelection";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
