import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

type QuestionnaireTemplateRow = Database["public"]["Tables"]["questionnaire_templates"]["Row"];

export type QuestionnaireRow = Database["public"]["Tables"]["questionnaires"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export type QuestionnaireResponseRecord = Record<string, unknown>;
export type IncludesField = (fieldKey: string) => boolean;

type TemplateFieldScope = {
  includesAny: (fieldKeys: readonly string[]) => boolean;
  includesField: IncludesField;
  isTemplateScoped: boolean;
};

export const readRecord = (value: unknown): QuestionnaireResponseRecord => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as QuestionnaireResponseRecord)
    : {};
};

export const readString = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

export const readArray = (value: unknown) => {
  return Array.isArray(value) ? value.map(readRecord) : [];
};

export const readTime = (value: string, fallback: string | null) => {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value) ? value : fallback;
};

export const readInteger = (value: unknown) => {
  const numericValue = typeof value === "number" ? value : Number(readString(value));
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
};

const normalizeKey = (value: string) => value.trim().toLowerCase();

const normalizePhoneKey = (value: string) => value.replace(/\D/g, "");

export const buildSecondaryContactDedupKey = (contact: {
  email: string;
  name: string;
  phone: string;
}) => {
  const nameKey = normalizeKey(contact.name);
  const emailKey = normalizeKey(contact.email);
  const phoneKey = normalizePhoneKey(contact.phone);

  if (emailKey) return `email:${emailKey}`;
  if (phoneKey) return `phone:${phoneKey}`;
  return `name:${nameKey}`;
};

export const parseSecondaryContact = (value: unknown) => {
  const text = readString(value);
  if (!text) return null;

  const separators = [/\s+-\s+/, /\s*&\s+/, /\s*\|\s*/, /\n+/];
  for (const separator of separators) {
    const parts = text.split(separator).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        name: parts[0],
        role: parts.slice(1).join(" "),
      };
    }
  }

  return { name: text, role: "" };
};

export const parseSecondaryContacts = (value: unknown) => {
  const items = readArray(value)
    .map((item) => ({
      email: readString(item.email),
      name: readString(item.name),
      phone: readString(item.phone),
      role: readString(item.role),
    }))
    .filter((contact) => contact.name || contact.role || contact.email || contact.phone);

  return items;
};

const readFieldKeysFromTemplate = (definition: QuestionnaireTemplateRow["definition"]) => {
  const root = readRecord(definition);
  const sections = Array.isArray(root.sections) ? root.sections : [];
  const keys = new Set<string>();

  for (const section of sections) {
    const sectionRecord = readRecord(section);
    const questions = Array.isArray(sectionRecord.questions)
      ? sectionRecord.questions
      : [];

    for (const question of questions) {
      const questionRecord = readRecord(question);
      const fieldKey = readString(questionRecord.fieldKey);
      if (fieldKey) keys.add(fieldKey);
    }
  }

  return keys;
};

export const listTemplateFieldKeys = async (
  database: SupabaseClient<Database>,
  templateKey: string,
) => {
  if (!templateKey) return new Set<string>();

  const templateResult = await database
    .from("questionnaire_templates")
    .select("definition")
    .eq("template_key", templateKey)
    .maybeSingle();

  if (templateResult.error) throw templateResult.error;
  if (!templateResult.data) return new Set<string>();

  return readFieldKeysFromTemplate(templateResult.data.definition);
};

export const createTemplateFieldScope = (templateFieldKeys: Set<string>): TemplateFieldScope => {
  const isTemplateScoped = templateFieldKeys.size > 0;
  const includesField: IncludesField = (fieldKey: string) => {
    return !isTemplateScoped || templateFieldKeys.has(fieldKey);
  };

  return {
    includesAny: (fieldKeys) => fieldKeys.some((fieldKey) => includesField(fieldKey)),
    includesField,
    isTemplateScoped,
  };
};

export const isQuestionnaireReady = (row: QuestionnaireRow) => {
  return row.status === "submitted" && row.review_status === "approved";
};
