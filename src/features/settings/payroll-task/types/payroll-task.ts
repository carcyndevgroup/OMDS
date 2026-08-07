import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";

export type PayrollTaskCategory = "driver" | "operator" | "warehouse" | "kitchen";
export type PayrollTaskPayRule = "fixed" | "operator_hours" | "driver_direction" | "churro_dough";

export type PayrollTask = CrmRecordMeta & {
  additionalUnitAmountMxn: string;
  baseAmountMxn: string;
  category: PayrollTaskCategory;
  includedQuantity: string;
  isActive: boolean;
  name: string;
  notes: string;
  overtimeRateMxn: string;
  payRule: PayrollTaskPayRule;
  sortOrder: string;
  taskKey: string;
  unitLabel: string;
};

export type PayrollTaskFormValues = {
  additionalUnitAmountMxn: string;
  baseAmountMxn: string;
  category: PayrollTaskCategory | "";
  includedQuantity: string;
  isActive: boolean;
  name: string;
  notes: string;
  overtimeRateMxn: string;
  payRule: PayrollTaskPayRule | "";
  sortOrder: string;
  taskKey: string;
  unitLabel: string;
};
