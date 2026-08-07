import { settingsEn, settingsEs } from "@/core/i18n/dictionaries/settings-dictionary";
import { questionFieldOptions } from "@/features/settings/questionnaire-template/components/questionnaire-definition-options";

import type {
  QuestionnaireFieldCatalogFormValues,
  QuestionnaireFieldType,
} from "../types/questionnaire-field-catalog";

const questionTypeOverrides: Record<string, QuestionnaireFieldType> = {
  "additional.operationalNotes": "textarea",
  "additional.specialRequests": "textarea",
  "additional.secondaryContacts": "repeatable",
  "additional.secondaryContact": "text",
  "client.additionalClients": "repeatable",
  "client.role": "select",
  "client.preferredCommunicationMethod": "select",
  "event.guestCount": "number",
  "event.serviceEndTime": "time",
  "event.serviceStartTime": "time",
};

const targetTableOverrides: Record<string, string> = {
  "additional.secondaryContacts": "event_venue_contacts",
  "additional.secondaryContact": "events",
  "client.role": "event_contacts",
  "venue.assignedContact.email": "event_venue_contacts",
  "venue.assignedContact.name": "event_venue_contacts",
  "venue.assignedContact.phone": "event_venue_contacts",
  "venue.assignedContact.role": "event_venue_contacts",
};

const targetColumnOverrides: Record<string, string> = {
  "additional.operationalNotes": "client_operational_notes",
  "additional.specialRequests": "special_requests",
  "additional.secondaryContacts": "event_venue_contacts",
  "additional.secondaryContact": "secondary_contact",
  "client.additionalClients": "event_contacts",
  "client.role": "role",
  "client.preferredCommunicationMethod": "preferred_communication_method",
  "event.eventHashtags": "event_hashtags",
  "event.eventName": "event_name",
  "event.marqueeNames": "marquee_sign_names",
  "event.serviceEndTime": "service_end_time",
  "event.serviceLocationDescription": "service_location_description",
  "event.serviceStartTime": "service_start_time",
  "venue.powerSupplyAccess": "power_supply_access",
  "venue.powerSupplyNotes": "power_supply_notes",
};

function toSnakeCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .toLowerCase()
    .replace(/^_+|_+$/g, "");
}

function inferTargetTable(fieldKey: string) {
  if (targetTableOverrides[fieldKey]) return targetTableOverrides[fieldKey];

  const [scope] = fieldKey.split(".");

  switch (scope) {
    case "client":
      return "clients";
    case "event":
      return "events";
    case "venue":
      return "events";
    case "planner":
    case "coordinator":
      return "planners";
    case "additional":
      return "events";
    default:
      return "events";
  }
}

function inferTargetColumn(fieldKey: string) {
  if (targetColumnOverrides[fieldKey]) return targetColumnOverrides[fieldKey];

  const parts = fieldKey.split(".");
  const path = parts.slice(1).join("_");
  return toSnakeCase(path || fieldKey);
}

function inferQuestionType(fieldKey: string): QuestionnaireFieldType {
  if (questionTypeOverrides[fieldKey]) return questionTypeOverrides[fieldKey];
  return "text";
}

export function getQuestionnaireFieldCatalogDefaults(fieldKey: string) {
  const option = questionFieldOptions.find((currentOption) => currentOption.value === fieldKey);
  if (!option) return null;

  return {
    fieldKey,
    helperEn: "",
    helperEs: "",
    isActive: true,
    labelEn: settingsEn[option.labelKey as keyof typeof settingsEn] ?? option.value,
    labelEs: settingsEs[option.labelKey as keyof typeof settingsEs] ?? option.value,
    questionType: inferQuestionType(fieldKey),
    targetColumn: inferTargetColumn(fieldKey),
    targetTable: inferTargetTable(fieldKey),
  };
}

export function buildDefaultQuestionnaireFieldCatalogValues(): QuestionnaireFieldCatalogFormValues[] {
  return questionFieldOptions.map((option, index) => {
    const fieldKey = option.value;
    const defaults = getQuestionnaireFieldCatalogDefaults(fieldKey);

    return {
      helperEn: defaults?.helperEn ?? "",
      helperEs: defaults?.helperEs ?? "",
      isActive: defaults?.isActive ?? true,
      labelEn: defaults?.labelEn ?? option.value,
      labelEs: defaults?.labelEs ?? option.value,
      questionType: defaults?.questionType ?? inferQuestionType(fieldKey),
      fieldKey,
      sortOrder: String((index + 1) * 10),
      targetColumn: defaults?.targetColumn ?? inferTargetColumn(fieldKey),
      targetTable: defaults?.targetTable ?? inferTargetTable(fieldKey),
    };
  });
}
