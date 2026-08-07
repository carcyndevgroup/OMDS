import type { TranslationKey } from "@/core/i18n";

import { DEFAULT_EMITTER_TAX_REGIME } from "../constants/sat-catalog-options";
import type {
  SatBankAccount,
  SatBankAccountFormValues,
  SatFiscalProfile,
  SatFiscalProfileFormValues,
} from "../types/sat-settings";

export type SatFiscalProfileErrors = Partial<Record<keyof SatFiscalProfileFormValues, TranslationKey>>;
export type SatBankAccountErrors = Partial<Record<keyof SatBankAccountFormValues, TranslationKey>>;

export const initialFiscalProfileValues: SatFiscalProfileFormValues = {
  constanciaFileUrl: "",
  isActive: true,
  label: "",
  legalName: "",
  opinionExpiresAt: "",
  opinionFileUrl: "",
  rfc: "",
  taxRegime: DEFAULT_EMITTER_TAX_REGIME,
};

export const initialBankAccountValues: SatBankAccountFormValues = {
  accountNumber: "",
  bankName: "",
  beneficiaryName: "",
  clabe: "",
  currency: "mxn",
  fiscalProfileId: "",
  isActive: true,
  nickname: "",
};

export const toFiscalProfileValues = (
  profile: SatFiscalProfile,
): SatFiscalProfileFormValues => ({
  constanciaFileUrl: profile.constanciaFileUrl,
  isActive: profile.isActive,
  label: profile.label,
  legalName: profile.legalName,
  opinionExpiresAt: profile.opinionExpiresAt ?? "",
  opinionFileUrl: profile.opinionFileUrl,
  rfc: profile.rfc,
  taxRegime: profile.taxRegime,
});

export const toBankAccountValues = (
  account: SatBankAccount,
): SatBankAccountFormValues => ({
  accountNumber: account.accountNumber,
  bankName: account.bankName,
  beneficiaryName: account.beneficiaryName,
  clabe: account.clabe,
  currency: account.currency,
  fiscalProfileId: account.fiscalProfileId ?? "",
  isActive: account.isActive,
  nickname: account.nickname,
});

export function validateFiscalProfile(values: SatFiscalProfileFormValues) {
  const errors: SatFiscalProfileErrors = {};
  if (!values.label.trim()) errors.label = "satFacturas.validation.required";
  if (!values.legalName.trim()) errors.legalName = "satFacturas.validation.required";
  if (!values.rfc.trim()) errors.rfc = "satFacturas.validation.required";
  if (!values.taxRegime.trim()) errors.taxRegime = "satFacturas.validation.required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateBankAccount(values: SatBankAccountFormValues) {
  const errors: SatBankAccountErrors = {};
  if (!values.nickname.trim()) errors.nickname = "satFacturas.validation.required";
  if (!values.bankName.trim()) errors.bankName = "satFacturas.validation.required";
  if (!values.clabe.trim()) errors.clabe = "satFacturas.validation.required";
  if (!values.beneficiaryName.trim()) errors.beneficiaryName = "satFacturas.validation.required";
  if (!values.currency.trim()) errors.currency = "satFacturas.validation.required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}
