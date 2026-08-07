import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";
import type { Json } from "@/core/supabase/json.types";

import type { QuestionnaireTemplate, QuestionnaireTemplateFormValues } from "../types/questionnaire-template";

type QuestionnaireTemplateRow = Database["public"]["Tables"]["questionnaire_templates"]["Row"];

export const DEFAULT_TEMPLATE_DELETE_FORBIDDEN = "default_template_delete_forbidden";
export const TEMPLATE_IN_USE_DELETE_FORBIDDEN = "template_in_use_delete_forbidden";

function createGuardedError(code: string) {
  const guardedError = new Error(code) as Error & { code: string };
  guardedError.code = code;
  return guardedError;
}

const toQuestionnaireTemplate = (row: QuestionnaireTemplateRow): QuestionnaireTemplate => ({
  bookingType: row.booking_type as BookingType | "",
  createdAt: row.created_at,
  definition: row.definition,
  description: row.description,
  eventType: row.event_type as EventType | "",
  id: row.id,
  isActive: row.is_active,
  isDefault: row.is_default,
  templateKey: row.template_key,
  title: row.title,
  updatedAt: row.updated_at,
});

const toPayload = (values: QuestionnaireTemplateFormValues) => ({
  booking_type: values.bookingType || null,
  definition: parseDefinition(values.definitionJson),
  description: values.description.trim(),
  event_type: values.eventType || null,
  is_active: values.isActive,
  is_default: values.isDefault,
  template_key: values.templateKey.trim(),
  title: values.title.trim(),
});

function parseDefinition(value: string): Json {
  return JSON.parse(value) as Json;
}

export async function createQuestionnaireTemplate(
  database: SupabaseClient<Database>,
  values: QuestionnaireTemplateFormValues,
) {
  const result = await database.from("questionnaire_templates").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  return toQuestionnaireTemplate(result.data);
}

export async function findQuestionnaireTemplate(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("questionnaire_templates").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toQuestionnaireTemplate(result.data) : null;
}

export async function listQuestionnaireTemplates(database: SupabaseClient<Database>) {
  const result = await database.from("questionnaire_templates").select("*").order("is_default", { ascending: false }).order("title");
  if (result.error) throw result.error;
  return result.data.map(toQuestionnaireTemplate);
}

export async function updateQuestionnaireTemplate(
  database: SupabaseClient<Database>,
  id: string,
  values: QuestionnaireTemplateFormValues,
) {
  const result = await database.from("questionnaire_templates").update(toPayload(values)).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toQuestionnaireTemplate(result.data) : null;
}

export async function setQuestionnaireTemplateActive(
  database: SupabaseClient<Database>,
  id: string,
  isActive: boolean,
) {
  const result = await database
    .from("questionnaire_templates")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toQuestionnaireTemplate(result.data) : null;
}

export async function deleteQuestionnaireTemplate(database: SupabaseClient<Database>, id: string) {
  const templateResult = await database
    .from("questionnaire_templates")
    .select("template_key,is_default")
    .eq("id", id)
    .maybeSingle();
  if (templateResult.error) throw templateResult.error;

  if (templateResult.data?.is_default) {
    throw createGuardedError(DEFAULT_TEMPLATE_DELETE_FORBIDDEN);
  }

  if (templateResult.data?.template_key) {
    const questionnaireUsageResult = await database
      .from("questionnaires")
      .select("id")
      .eq("template_key", templateResult.data.template_key)
      .limit(1)
      .maybeSingle();
    if (questionnaireUsageResult.error) throw questionnaireUsageResult.error;

    const quoteVersionUsageResult = await database
      .from("quote_versions")
      .select("id")
      .eq("questionnaire_template_key", templateResult.data.template_key)
      .limit(1)
      .maybeSingle();
    if (quoteVersionUsageResult.error) throw quoteVersionUsageResult.error;

    if (questionnaireUsageResult.data || quoteVersionUsageResult.data) {
      throw createGuardedError(TEMPLATE_IN_USE_DELETE_FORBIDDEN);
    }
  }

  const result = await database.from("questionnaire_templates").delete().eq("id", id);
  if (result.error) throw result.error;
}
