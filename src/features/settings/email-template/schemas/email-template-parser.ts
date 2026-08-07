import type { EmailTemplateFormValues } from "../types/email-template";
import { initialEmailTemplateFormValues } from "./email-template-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof EmailTemplateFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

const readBoolean = (
  source: UnknownRecord,
  key: keyof EmailTemplateFormValues,
  fallback: boolean,
) => {
  return typeof source[key] === "boolean" ? (source[key] as boolean) : fallback;
};

export function parseEmailTemplateFormValues(input: unknown): EmailTemplateFormValues {
  const source = isRecord(input) ? input : {};
  const documentKindRaw = readString(source, "documentKind");
  const documentKind =
    documentKindRaw === "questionnaire"
    || documentKindRaw === "contract"
    || documentKindRaw === "invoice"
    || documentKindRaw === "quote"
    || documentKindRaw === "general"
      ? documentKindRaw
      : initialEmailTemplateFormValues.documentKind;

  return {
    body: readString(source, "body"),
    description: readString(source, "description"),
    documentKind,
    isActive: readBoolean(source, "isActive", initialEmailTemplateFormValues.isActive),
    isDefault: readBoolean(source, "isDefault", initialEmailTemplateFormValues.isDefault),
    subject: readString(source, "subject"),
    templateKey: readString(source, "templateKey"),
    title: readString(source, "title"),
  };
}
