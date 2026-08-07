import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import { productCategoryOptions } from "../constants/product-options";
import type { ProductItem } from "../types/product";

type ProductListCardProps = {
  product: ProductItem;
  t: Translate;
};

export function ProductListCard({ product, t }: ProductListCardProps) {
  const categoryKey = productCategoryOptions.find((option) => {
    return option.value === product.category;
  })?.translationKey;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{product.name}</h2>
            {categoryKey ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t(categoryKey)}</span> : null}
            {product.family ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">{product.family}</span> : null}
            {!product.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.product.status.inactive")}</span> : null}
          </div>
          {product.description ? <p className="mt-3 text-sm text-zinc-500">{product.description}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="text-sm font-bold text-zinc-400">
            {t("settings.product.list.cog")} {formatMoneyMxn(product.cogMxn)} / {t("settings.product.list.price")} {formatMoneyMxn(product.priceMxn)}
          </div>
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/products/${product.id}/edit`}>
            <Pencil aria-hidden="true" size={16} />
            {t("settings.product.action.edit")}
          </Link>
        </div>
      </div>
    </article>
  );
}
