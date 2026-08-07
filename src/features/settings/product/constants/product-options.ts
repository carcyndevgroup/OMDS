import type { TranslationKey } from "@/core/i18n";

import type { ProductCategory } from "../types/product";

type ProductOption<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const productCategoryOptions: ProductOption<ProductCategory>[] = [
  { value: "dessert", translationKey: "settings.product.category.dessert" },
  { value: "snack", translationKey: "settings.product.category.snack" },
];
