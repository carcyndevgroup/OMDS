import type { QuestionnaireFieldCatalogFormValues } from "../types/questionnaire-field-catalog";
import { initialQuestionnaireFieldCatalogFormValues } from "./questionnaire-field-catalog-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof QuestionnaireFieldCatalogFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

export function parseQuestionnaireFieldCatalogFormValues(input: unknown): QuestionnaireFieldCatalogFormValues {
  const source = isRecord(input) ? input : {};

  return {
    fieldKey: readString(source, "fieldKey"),
    helperEn: readString(source, "helperEn"),
    helperEs: readString(source, "helperEs"),
    isActive: typeof source.isActive === "boolean" ? source.isActive : initialQuestionnaireFieldCatalogFormValues.isActive,
    labelEn: readString(source, "labelEn"),
    labelEs: readString(source, "labelEs"),
    questionType: (readString(source, "questionType") as QuestionnaireFieldCatalogFormValues["questionType"]) || initialQuestionnaireFieldCatalogFormValues.questionType,
    sortOrder: readString(source, "sortOrder") || initialQuestionnaireFieldCatalogFormValues.sortOrder,
    targetColumn: readString(source, "targetColumn"),
    targetTable: readString(source, "targetTable") || initialQuestionnaireFieldCatalogFormValues.targetTable,
  };
}
