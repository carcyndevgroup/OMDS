import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  QuestionnaireFieldCatalogFormValues,
  QuestionnaireFieldCatalogItem,
} from "../types/questionnaire-field-catalog";

type QuestionnaireFieldCatalogImportResult = {
  created: number;
  total: number;
  updated: number;
};

type FieldCatalogRow = Database["public"]["Tables"]["questionnaire_field_catalog"]["Row"];

const toItem = (row: FieldCatalogRow): QuestionnaireFieldCatalogItem => ({
  createdAt: row.created_at,
  fieldKey: row.field_key,
  helperEn: row.helper_en,
  helperEs: row.helper_es,
  id: row.id,
  isActive: row.is_active,
  labelEn: row.label_en,
  labelEs: row.label_es,
  questionType: row.question_type as QuestionnaireFieldCatalogItem["questionType"],
  sortOrder: String(row.sort_order),
  targetColumn: row.target_column,
  targetTable: row.target_table,
  updatedAt: row.updated_at,
});

const toPayload = (values: QuestionnaireFieldCatalogFormValues) => ({
  field_key: values.fieldKey.trim(),
  helper_en: values.helperEn.trim(),
  helper_es: values.helperEs.trim(),
  is_active: values.isActive,
  label_en: values.labelEn.trim(),
  label_es: values.labelEs.trim(),
  question_type: values.questionType,
  sort_order: Number(values.sortOrder || 0),
  target_column: values.targetColumn.trim(),
  target_table: values.targetTable.trim(),
});

export async function createQuestionnaireFieldCatalogItem(
  database: SupabaseClient<Database>,
  values: QuestionnaireFieldCatalogFormValues,
) {
  const result = await database.from("questionnaire_field_catalog").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  return toItem(result.data);
}

export async function findQuestionnaireFieldCatalogItem(
  database: SupabaseClient<Database>,
  id: string,
) {
  const result = await database.from("questionnaire_field_catalog").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toItem(result.data) : null;
}

export async function listQuestionnaireFieldCatalogItems(database: SupabaseClient<Database>) {
  const result = await database.from("questionnaire_field_catalog").select("*").order("sort_order").order("label_en");
  if (result.error) throw result.error;
  return result.data.map(toItem);
}

export async function updateQuestionnaireFieldCatalogItem(
  database: SupabaseClient<Database>,
  id: string,
  values: QuestionnaireFieldCatalogFormValues,
) {
  const result = await database.from("questionnaire_field_catalog").update(toPayload(values)).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toItem(result.data) : null;
}

export async function importQuestionnaireFieldCatalogItems(
  database: SupabaseClient<Database>,
  values: QuestionnaireFieldCatalogFormValues[],
): Promise<QuestionnaireFieldCatalogImportResult> {
  if (!values.length) return { created: 0, total: 0, updated: 0 };

  const existingResult = await database.from("questionnaire_field_catalog").select("field_key");
  if (existingResult.error) throw existingResult.error;

  const existingKeys = new Set(existingResult.data.map((row) => row.field_key));
  const created = values.reduce((count, item) => (existingKeys.has(item.fieldKey) ? count : count + 1), 0);
  const payload = values.map(toPayload);

  const upsertResult = await database
    .from("questionnaire_field_catalog")
    .upsert(payload, { onConflict: "field_key" });

  if (upsertResult.error) throw upsertResult.error;

  return {
    created,
    total: values.length,
    updated: values.length - created,
  };
}
