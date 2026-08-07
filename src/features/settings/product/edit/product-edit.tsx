"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { ProductForm } from "../components/product-form";
import { ProductPageHeader } from "../components/product-page-header";
import { useProduct } from "../hooks/use-product";
import { useProductMutation } from "../hooks/use-product-mutation";
import type { ProductFormValues, ProductItem } from "../types/product";

type ProductEditProps = { id: string };

const toFormValues = (product: ProductItem): ProductFormValues => ({
  category: product.category,
  cogMxn: product.cogMxn,
  description: product.description,
  family: product.family,
  isActive: product.isActive,
  isTaxable: product.isTaxable,
  name: product.name,
  notes: product.notes,
  priceMxn: product.priceMxn,
});

export function ProductEdit({ id }: ProductEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const state = useProduct(id);
  const mutation = useProductMutation(id);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.product.loading")}</main>;
  }

  if (state.hasError || !state.product) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.product.loadError")}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <ProductPageHeader backLabel={t("settings.product.action.back")} title={t("settings.product.edit.title")} />
        <ProductForm
          cancelHref="/settings/products"
          errorKey="settings.product.edit.error"
          initialValues={toFormValues(state.product)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/products")}
          status={mutation.status}
          submitKey="settings.product.action.save"
          successKey="settings.product.edit.success"
        />
      </div>
    </main>
  );
}
