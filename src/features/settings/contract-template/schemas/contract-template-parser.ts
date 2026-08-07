import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";

import type { ContractTemplateFormValues } from "../types/contract-template";
import { initialContractTemplateFormValues } from "./contract-template-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof ContractTemplateFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

const readBoolean = (
  source: UnknownRecord,
  key: keyof ContractTemplateFormValues,
  fallback: boolean,
) => {
  return typeof source[key] === "boolean" ? (source[key] as boolean) : fallback;
};

export function parseContractTemplateFormValues(input: unknown): ContractTemplateFormValues {
  const source = isRecord(input) ? input : {};
  return {
    body: readString(source, "body"),
    bookingType: (readString(source, "bookingType") as BookingType | "") || initialContractTemplateFormValues.bookingType,
    description: readString(source, "description"),
    eventType: (readString(source, "eventType") as EventType | "") || initialContractTemplateFormValues.eventType,
    isActive: readBoolean(source, "isActive", initialContractTemplateFormValues.isActive),
    isDefault: readBoolean(source, "isDefault", initialContractTemplateFormValues.isDefault),
    templateKey: readString(source, "templateKey"),
    title: readString(source, "title"),
  };
}
