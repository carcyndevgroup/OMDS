import type { TranslationKey } from "@/core/i18n";

import type { SigningProfile } from "../types/signing-profile";

export type SigningProfileErrors = Partial<Record<keyof SigningProfile, TranslationKey>>;

export const initialSigningProfile: SigningProfile = {
  authorizedSignerFullName: "",
  authorizedSignerTitle: "",
};

export function validateSigningProfile(values: SigningProfile) {
  const errors: SigningProfileErrors = {};

  if (!values.authorizedSignerFullName.trim()) {
    errors.authorizedSignerFullName = "settings.signingProfile.validation.required";
  }

  if (!values.authorizedSignerTitle.trim()) {
    errors.authorizedSignerTitle = "settings.signingProfile.validation.required";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
