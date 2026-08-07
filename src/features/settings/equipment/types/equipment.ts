import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";

export type EquipmentCategory =
  | "booth"
  | "booth_top"
  | "cannoli_box"
  | "churro_cart"
  | "food_warmer"
  | "fountain"
  | "freezer"
  | "pancake"
  | "popcorn"
  | "rollz"
  | "slowcooker"
  | "smores_bar"
  | "toaster_oven"
  | "waffle"
  | "other";

export type EquipmentItem = CrmRecordMeta & {
  category: EquipmentCategory;
  isActive: boolean;
  name: string;
  notes: string;
};

export type EquipmentFormValues = {
  category: EquipmentCategory | "";
  isActive: boolean;
  name: string;
  notes: string;
};
