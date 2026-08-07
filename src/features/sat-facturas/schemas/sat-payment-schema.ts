import type { TranslationKey } from "@/core/i18n";

import type { SatPaymentFormValues } from "../types/sat-factura";

export type SatPaymentErrors = Partial<Record<keyof SatPaymentFormValues, TranslationKey>>;

export const initialSatPaymentValues: SatPaymentFormValues = {
  allocations: [],
  amountMxn: "",
  bankAccountId: "",
  notes: "",
  paymentDate: "",
  proofFileUrl: "",
  reference: "",
  venueId: "",
};

const amount = (value: string) => Number(value || 0);

export function validateSatPayment(values: SatPaymentFormValues) {
  const errors: SatPaymentErrors = {};
  const allocationTotal = values.allocations.reduce(
    (total, allocation) => total + amount(allocation.amountMxn),
    0,
  );

  if (!values.paymentDate) errors.paymentDate = "satFacturas.validation.required";
  if (amount(values.amountMxn) <= 0) errors.amountMxn = "satFacturas.validation.required";
  if (!values.allocations.length) errors.allocations = "satFacturas.payment.validation.allocationRequired";
  if (values.allocations.some((allocation) => amount(allocation.amountMxn) <= 0)) {
    errors.allocations = "satFacturas.payment.validation.allocationAmount";
  }
  if (allocationTotal > amount(values.amountMxn)) {
    errors.allocations = "satFacturas.payment.validation.allocationLimit";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
