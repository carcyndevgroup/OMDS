import type { TranslationKey } from "@/core/i18n";

import { eventStaffPositionOptions } from "../constants/staff-options";
import type { EventStaffFormValues } from "../types/staff";

export type EventStaffFormErrors = Partial<
  Record<keyof EventStaffFormValues, TranslationKey>
>;

export const initialEventStaffFormValues: EventStaffFormValues = {
  notes: "",
  position: "",
  staffMemberId: "",
};

const hasPosition = (value: string) => {
  return eventStaffPositionOptions.some((option) => option.value === value);
};

export function validateEventStaffForm(values: EventStaffFormValues) {
  const errors: EventStaffFormErrors = {};
  if (!values.position || !hasPosition(values.position)) {
    errors.position = "crm.staff.validation.required";
  }
  if (!values.staffMemberId) {
    errors.staffMemberId = "crm.staff.validation.required";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
