import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";

import type { QuestionnaireTemplateFormValues } from "../types/questionnaire-template";
import { initialQuestionnaireTemplateFormValues } from "./questionnaire-template-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof QuestionnaireTemplateFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

const readBoolean = (
  source: UnknownRecord,
  key: keyof QuestionnaireTemplateFormValues,
  fallback: boolean,
) => {
  return typeof source[key] === "boolean" ? (source[key] as boolean) : fallback;
};

export function parseQuestionnaireTemplateFormValues(input: unknown): QuestionnaireTemplateFormValues {
  const source = isRecord(input) ? input : {};
  return {
    bookingType: (readString(source, "bookingType") as BookingType | "") || initialQuestionnaireTemplateFormValues.bookingType,
    definitionJson: readString(source, "definitionJson") || initialQuestionnaireTemplateFormValues.definitionJson,
    description: readString(source, "description"),
    eventType: (readString(source, "eventType") as EventType | "") || initialQuestionnaireTemplateFormValues.eventType,
    isActive: readBoolean(source, "isActive", initialQuestionnaireTemplateFormValues.isActive),
    isDefault: readBoolean(source, "isDefault", initialQuestionnaireTemplateFormValues.isDefault),
    templateKey: readString(source, "templateKey"),
    title: readString(source, "title"),
  };
}
