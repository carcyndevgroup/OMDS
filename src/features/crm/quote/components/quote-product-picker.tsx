"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import type { Translate } from "@/features/crm/shared/types/form-types";
import type { ProductItem } from "@/features/settings/product";

import type { QuoteAddProductValues } from "../types/quote";

type QuoteProductPickerProps = {
  onAdd: (values: QuoteAddProductValues) => Promise<void>;
  products: ProductItem[];
  t: Translate;
};

export function QuoteProductPicker({
  onAdd,
  products,
  t,
}: QuoteProductPickerProps) {
  const [values, setValues] = useState<QuoteAddProductValues>({
    productId: "",
    quantity: "1",
  });

  const add = async () => {
    if (!values.productId || Number(values.quantity) <= 0) return;
    await onAdd(values);
    setValues({ productId: "", quantity: "1" });
  };

  return (
    <div className="grid gap-4 border-t border-zinc-800 pt-4 md:grid-cols-[1fr_8rem_auto] md:items-end">
      <CrmSelect
        label={t("crm.quote.field.product")}
        onChange={(value) => {
          setValues((current) => ({ ...current, productId: value }));
        }}
        options={products.filter((product) => product.isActive).map((product) => ({
          label: product.name,
          value: product.id,
        }))}
        placeholderKey="crm.quote.placeholder.product"
        t={t}
        value={values.productId}
      />
      <CrmTextInput
        label={t("crm.quote.field.quantity")}
        onChange={(value) => {
          setValues((current) => ({ ...current, quantity: value }));
        }}
        t={t}
        type="number"
        value={values.quantity}
      />
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200"
        onClick={add}
        type="button"
      >
        <Plus aria-hidden="true" size={16} />
        {t("crm.quote.action.addProduct")}
      </button>
    </div>
  );
}
