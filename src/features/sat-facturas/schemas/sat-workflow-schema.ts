import type { TranslationKey } from "@/core/i18n";

import type {
  SatFacturaDetail,
  SatFacturaStatus,
  SatFacturaWorkflowValues,
} from "../types/sat-factura";

export type SatWorkflowErrors = Partial<Record<keyof SatFacturaWorkflowValues, TranslationKey>>;

export const statusOptions = [
  { translationKey: "satFacturas.status.pending", value: "pending" },
  { translationKey: "satFacturas.status.accountant_requested", value: "accountant_requested" },
  { translationKey: "satFacturas.status.issued", value: "issued" },
  { translationKey: "satFacturas.status.sent_to_venue", value: "sent_to_venue" },
  { translationKey: "satFacturas.status.partially_paid", value: "partially_paid" },
  { translationKey: "satFacturas.status.paid", value: "paid" },
  { translationKey: "satFacturas.status.cancelled", value: "cancelled" },
] as const;

export const complementoStatusOptions = [
  { translationKey: "satFacturas.complemento.notRequired", value: "not_required" },
  { translationKey: "satFacturas.complemento.pending", value: "pending" },
  { translationKey: "satFacturas.complemento.requested", value: "requested" },
  { translationKey: "satFacturas.complemento.received", value: "received" },
  { translationKey: "satFacturas.complemento.sent", value: "sent" },
] as const;

const dateValue = (value: string | null) => value ? value.slice(0, 10) : "";

export function toWorkflowValues(factura: SatFacturaDetail): SatFacturaWorkflowValues {
  return {
    accountantRequestedAt: dateValue(factura.accountantRequestedAt),
    complementoPdfUrl: factura.complementoPdfUrl,
    complementoReceivedAt: dateValue(factura.complementoReceivedAt),
    complementoRequestedAt: dateValue(factura.complementoRequestedAt),
    complementoSentAt: dateValue(factura.complementoSentAt),
    complementoStatus: factura.complementoStatus,
    complementoXmlUrl: factura.complementoXmlUrl,
    facturaNumber: factura.facturaNumber,
    facturaPdfUrl: factura.facturaPdfUrl,
    facturaXmlUrl: factura.facturaXmlUrl,
    issuedAt: dateValue(factura.issuedAt),
    paidAt: dateValue(factura.paidAt),
    sentToVenueAt: dateValue(factura.sentToVenueAt),
    status: factura.status,
    uuidFiscal: factura.uuidFiscal,
  };
}

export function parseWorkflowValues(input: unknown): SatFacturaWorkflowValues {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const text = (key: keyof SatFacturaWorkflowValues) =>
    typeof source[key] === "string" ? source[key] : "";

  return {
    accountantRequestedAt: text("accountantRequestedAt"),
    complementoPdfUrl: text("complementoPdfUrl"),
    complementoReceivedAt: text("complementoReceivedAt"),
    complementoRequestedAt: text("complementoRequestedAt"),
    complementoSentAt: text("complementoSentAt"),
    complementoStatus: text("complementoStatus") || "not_required",
    complementoXmlUrl: text("complementoXmlUrl"),
    facturaNumber: text("facturaNumber"),
    facturaPdfUrl: text("facturaPdfUrl"),
    facturaXmlUrl: text("facturaXmlUrl"),
    issuedAt: text("issuedAt"),
    paidAt: text("paidAt"),
    sentToVenueAt: text("sentToVenueAt"),
    status: (text("status") || "pending") as SatFacturaStatus,
    uuidFiscal: text("uuidFiscal"),
  };
}

export function validateWorkflow(values: SatFacturaWorkflowValues) {
  const errors: SatWorkflowErrors = {};
  if (!values.status) errors.status = "satFacturas.validation.required";
  if (!values.complementoStatus) errors.complementoStatus = "satFacturas.validation.required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}
