import type { TranslationKey } from "@/core/i18n";

import type { EventEquipmentFormValues } from "../types/event-equipment";

export type EventEquipmentFormErrors = Partial<
  Record<keyof EventEquipmentFormValues, TranslationKey>
>;

export const initialEventEquipmentFormValues: EventEquipmentFormValues = {
  equipmentId: "",
  notes: "",
};

export function validateEventEquipmentForm(values: EventEquipmentFormValues) {
  const errors: EventEquipmentFormErrors = {};

  if (!values.equipmentId) {
    errors.equipmentId = "crm.event.equipment.validation.required";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
