import type { TranslationKey } from "@/core/i18n";

import type { EquipmentCategory } from "../types/equipment";

type EquipmentOption<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const equipmentCategoryOptions: EquipmentOption<EquipmentCategory>[] = [
  { value: "booth", translationKey: "settings.equipment.category.booth" },
  { value: "booth_top", translationKey: "settings.equipment.category.boothTop" },
  { value: "cannoli_box", translationKey: "settings.equipment.category.cannoliBox" },
  { value: "churro_cart", translationKey: "settings.equipment.category.churroCart" },
  { value: "food_warmer", translationKey: "settings.equipment.category.foodWarmer" },
  { value: "fountain", translationKey: "settings.equipment.category.fountain" },
  { value: "freezer", translationKey: "settings.equipment.category.freezer" },
  { value: "pancake", translationKey: "settings.equipment.category.pancake" },
  { value: "popcorn", translationKey: "settings.equipment.category.popcorn" },
  { value: "rollz", translationKey: "settings.equipment.category.rollz" },
  { value: "slowcooker", translationKey: "settings.equipment.category.slowcooker" },
  { value: "smores_bar", translationKey: "settings.equipment.category.smoresBar" },
  { value: "toaster_oven", translationKey: "settings.equipment.category.toasterOven" },
  { value: "waffle", translationKey: "settings.equipment.category.waffle" },
  { value: "other", translationKey: "settings.equipment.category.other" },
];
