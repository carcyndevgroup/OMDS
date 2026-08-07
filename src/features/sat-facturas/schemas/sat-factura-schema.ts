import type { TranslationKey } from "@/core/i18n";

import {
  DEFAULT_CFDI_USE,
  DEFAULT_PAYMENT_FORM,
  DEFAULT_PAYMENT_METHOD,
  DEFAULT_TAX_OBJECT,
} from "../constants/sat-catalog-options";
import type {
  SatFacturaDetail,
  SatFacturaFormValues,
} from "../types/sat-factura";
import { accountantRequestForDetail } from "../utils/sat-accountant-request-detail";

export type SatFacturaFormErrors = Partial<Record<keyof SatFacturaFormValues, TranslationKey>>;

export const initialSatFacturaValues: SatFacturaFormValues = {
  accountantRequestText: "",
  bankAccountId: "",
  cfdiUse: DEFAULT_CFDI_USE,
  dueAt: "",
  exchangeRateSource: "",
  exchangeRateToMxn: "1.000000",
  eventId: "",
  fiscalProfileId: "",
  ivaMxn: "0.00",
  ivaRetentionMxn: "0.000000",
  isrRetentionMxn: "0.000000",
  notes: "",
  pax: "",
  paymentForm: DEFAULT_PAYMENT_FORM,
  paymentMethod: DEFAULT_PAYMENT_METHOD,
  recipientName: "",
  recipientType: "client",
  rfc: "",
  serviceDescription: "",
  sourceTotalMxn: "0.00",
  subtotalMxn: "0.00",
  taxObject: DEFAULT_TAX_OBJECT,
  taxRegime: "",
  taxTotalMxn: "0.000000",
  totalMxn: "0.000000",
  unitValueMxn: "0.000000",
};

export const toSatFacturaValues = (
  factura: SatFacturaDetail,
): SatFacturaFormValues => ({
  accountantRequestText: accountantRequestForDetail(factura),
  bankAccountId: factura.bankAccountId ?? "",
  cfdiUse: factura.cfdiUse,
  dueAt: factura.dueAt ?? "",
  eventId: factura.eventId,
  exchangeRateSource: factura.exchangeRateSource,
  exchangeRateToMxn: factura.exchangeRateToMxn,
  fiscalProfileId: factura.fiscalProfileId ?? "",
  ivaMxn: factura.ivaMxn,
  ivaRetentionMxn: factura.ivaRetentionMxn,
  isrRetentionMxn: factura.isrRetentionMxn,
  notes: factura.notes,
  pax: factura.pax,
  paymentForm: factura.paymentForm,
  paymentMethod: factura.paymentMethod,
  recipientName: factura.recipientName,
  recipientType: factura.recipientType,
  rfc: factura.rfc,
  serviceDescription: factura.serviceDescription,
  sourceTotalMxn: factura.sourceTotalMxn,
  subtotalMxn: factura.subtotalMxn,
  taxObject: factura.taxObject,
  taxRegime: factura.taxRegime,
  taxTotalMxn: factura.taxTotalMxn,
  totalMxn: factura.totalMxn,
  unitValueMxn: factura.unitValueMxn,
});

const isValidAmount = (value: string) => Number.isFinite(Number(value)) && Number(value) >= 0;

export function validateSatFactura(values: SatFacturaFormValues) {
  const errors: SatFacturaFormErrors = {};

  if (!values.eventId) errors.eventId = "satFacturas.validation.required";
  if (!values.recipientName.trim()) errors.recipientName = "satFacturas.validation.required";
  if (!values.rfc.trim()) errors.rfc = "satFacturas.validation.required";
  if (!values.taxRegime.trim()) errors.taxRegime = "satFacturas.validation.required";
  if (!values.cfdiUse.trim()) errors.cfdiUse = "satFacturas.validation.required";
  if (!values.paymentMethod.trim()) errors.paymentMethod = "satFacturas.validation.required";
  if (!values.paymentForm.trim()) errors.paymentForm = "satFacturas.validation.required";
  if (!values.taxObject.trim()) errors.taxObject = "satFacturas.validation.required";
  if (values.exchangeRateToMxn && Number(values.exchangeRateToMxn) <= 0) {
    errors.exchangeRateToMxn = "satFacturas.validation.amount";
  }
  if (!isValidAmount(values.subtotalMxn)) errors.subtotalMxn = "satFacturas.validation.amount";
  if (!isValidAmount(values.taxTotalMxn)) errors.taxTotalMxn = "satFacturas.validation.amount";
  if (!isValidAmount(values.totalMxn)) errors.totalMxn = "satFacturas.validation.amount";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
