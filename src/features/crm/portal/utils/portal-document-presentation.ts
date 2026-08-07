import { buildDocumentNumber } from "@/features/crm/shared/documents/document-identifiers";

export function formatPortalDate(value: string | null, locale: "en" | "es") {
  if (!value) return locale === "es" ? "Sin fecha" : "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return locale === "es" ? "Sin fecha" : "No date";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", { dateStyle: "medium" }).format(date);
}

export function getDocumentNumber(kind: "contract" | "invoice" | "questionnaire" | "quote", id: string) {
  return buildDocumentNumber(kind, id);
}
