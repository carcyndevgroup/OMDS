import type { SatPaymentFormValues } from "../types/sat-factura";
import { initialSatPaymentValues } from "./sat-payment-schema";

const stringValue = (value: unknown) => typeof value === "string" ? value : "";

export function parseSatPaymentValues(input: unknown): SatPaymentFormValues {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const allocations = Array.isArray(source.allocations) ? source.allocations : [];

  return {
    allocations: allocations
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        amountMxn: stringValue(item.amountMxn),
        facturaId: stringValue(item.facturaId),
      }))
      .filter((item) => item.facturaId),
    amountMxn: stringValue(source.amountMxn),
    bankAccountId: stringValue(source.bankAccountId),
    notes: stringValue(source.notes),
    paymentDate: stringValue(source.paymentDate),
    proofFileUrl: stringValue(source.proofFileUrl),
    reference: stringValue(source.reference),
    venueId: stringValue(source.venueId) || initialSatPaymentValues.venueId,
  };
}
