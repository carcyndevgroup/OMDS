import type { TranslationKey } from "@/core/i18n";

import type { CompanyProfile } from "../types/company-profile";

export type CompanyProfileErrors = Partial<Record<keyof CompanyProfile, TranslationKey>>;

export const initialCompanyProfile: CompanyProfile = {
  legalName: "",
  dbaName: "",
  address: "",
  phone: "",
  email: "",
  website: "",
};

export function validateCompanyProfile(values: CompanyProfile) {
  const errors: CompanyProfileErrors = {};

  if (!values.legalName.trim()) {
    errors.legalName = "settings.companyProfile.validation.required";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
