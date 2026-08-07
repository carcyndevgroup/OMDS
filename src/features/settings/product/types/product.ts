import type { CrmRecordMeta } from "@/features/crm/shared/types/crm-record";

export type ProductCategory = "dessert" | "snack";

export type ProductItem = CrmRecordMeta & {
  category: ProductCategory;
  cogMxn: string;
  description: string;
  family: string;
  isActive: boolean;
  isTaxable: boolean;
  name: string;
  notes: string;
  priceMxn: string;
};

export type ProductFormValues = {
  category: ProductCategory | "";
  cogMxn: string;
  description: string;
  family: string;
  isActive: boolean;
  isTaxable: boolean;
  name: string;
  notes: string;
  priceMxn: string;
};
