import type { TranslationKey } from "@/core/i18n";

import type { EventFileFormValues } from "../types/event-file";

export type EventFileFormErrors = Partial<
  Record<keyof EventFileFormValues, TranslationKey>
>;

export const initialEventFileFormValues: EventFileFormValues = {
  fileName: "",
  fileUrl: "",
  includeOnRunSheet: true,
  notes: "",
};

export function validateEventFileForm(values: EventFileFormValues) {
  const errors: EventFileFormErrors = {};

  if (!values.fileName.trim()) {
    errors.fileName = "crm.event.files.validation.required";
  }

  if (!values.fileUrl.trim()) {
    errors.fileUrl = "crm.event.files.validation.required";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
