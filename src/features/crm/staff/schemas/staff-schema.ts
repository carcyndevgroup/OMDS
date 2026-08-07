import type { TranslationKey } from "@/core/i18n";

import type { StaffFormValues } from "../types/staff";

export type StaffFormErrors = Partial<Record<keyof StaffFormValues, TranslationKey>>;

export const initialStaffFormValues: StaffFormValues = {
  address: "",
  bankAccountNumber: "",
  bankBeneficiary: "",
  bankCardNumber: "",
  bankClabe: "",
  bankName: "",
  dateOfBirth: "",
  displayName: "",
  email: "",
  idBackFileUrl: "",
  idExpirationDate: "",
  idFrontFileUrl: "",
  idNumber: "",
  idType: "",
  isActive: true,
  isDriver: false,
  name: "",
  notes: "",
  phone: "",
};

export function validateStaffForm(values: StaffFormValues) {
  const errors: StaffFormErrors = {};
  if (!values.name.trim()) errors.name = "crm.staff.validation.required";
  if (!values.phone.trim()) errors.phone = "crm.staff.validation.required";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
