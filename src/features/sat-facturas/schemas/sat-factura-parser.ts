import type {
  SatFacturaFormValues,
  SatFacturaRecipientType,
} from "../types/sat-factura";
import { initialSatFacturaValues } from "./sat-factura-schema";

type InputRecord = Record<string, unknown>;

const record = (input: unknown): InputRecord =>
  input && typeof input === "object" ? (input as InputRecord) : {};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");

const recipientType = (value: unknown): SatFacturaRecipientType => {
  return value === "venue_hotel" || value === "other" || value === "client"
    ? value
    : initialSatFacturaValues.recipientType;
};

export function parseSatFacturaValues(input: unknown): SatFacturaFormValues {
  const source = record(input);

  return {
    accountantRequestText: stringValue(source.accountantRequestText),
    bankAccountId: stringValue(source.bankAccountId),
    cfdiUse: stringValue(source.cfdiUse) || initialSatFacturaValues.cfdiUse,
    dueAt: stringValue(source.dueAt),
    exchangeRateSource: stringValue(source.exchangeRateSource),
    exchangeRateToMxn: stringValue(source.exchangeRateToMxn) || initialSatFacturaValues.exchangeRateToMxn,
    eventId: stringValue(source.eventId),
    fiscalProfileId: stringValue(source.fiscalProfileId),
    ivaMxn: stringValue(source.ivaMxn) || "0.00",
    ivaRetentionMxn: stringValue(source.ivaRetentionMxn) || "0.00",
    isrRetentionMxn: stringValue(source.isrRetentionMxn) || "0.00",
    notes: stringValue(source.notes),
    pax: stringValue(source.pax),
    paymentForm: stringValue(source.paymentForm) || initialSatFacturaValues.paymentForm,
    paymentMethod: stringValue(source.paymentMethod) || initialSatFacturaValues.paymentMethod,
    recipientName: stringValue(source.recipientName),
    recipientType: recipientType(source.recipientType),
    rfc: stringValue(source.rfc),
    serviceDescription: stringValue(source.serviceDescription),
    sourceTotalMxn: stringValue(source.sourceTotalMxn) || "0.00",
    subtotalMxn: stringValue(source.subtotalMxn) || "0.00",
    taxObject: stringValue(source.taxObject) || initialSatFacturaValues.taxObject,
    taxRegime: stringValue(source.taxRegime),
    taxTotalMxn: stringValue(source.taxTotalMxn) || "0.00",
    totalMxn: stringValue(source.totalMxn) || "0.00",
    unitValueMxn: stringValue(source.unitValueMxn) || "0.00",
  };
}
