import type { TranslationKey } from "@/core/i18n";

import { equipmentCategoryOptions } from "../constants/equipment-options";
import type { EquipmentFormValues } from "../types/equipment";

export type EquipmentFormErrors = Partial<
  Record<keyof EquipmentFormValues, TranslationKey>
>;

export const initialEquipmentFormValues: EquipmentFormValues = {
  category: "",
  isActive: true,
  name: "",
  notes: "",
};

const hasCategory = (value: string) => {
  return equipmentCategoryOptions.some((option) => option.value === value);
};

export function validateEquipmentForm(values: EquipmentFormValues) {
  const errors: EquipmentFormErrors = {};
  if (!values.name.trim()) errors.name = "settings.equipment.validation.required";
  if (!values.category || !hasCategory(values.category)) {
    errors.category = "settings.equipment.validation.required";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
