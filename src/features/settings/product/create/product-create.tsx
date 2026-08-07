"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { ProductForm } from "../components/product-form";
import { ProductPageHeader } from "../components/product-page-header";
import { useProductMutation } from "../hooks/use-product-mutation";
import { initialProductFormValues } from "../schemas/product-schema";

export function ProductCreate() {
  const router = useRouter();
  const { t } = useTranslation();
  const mutation = useProductMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <ProductPageHeader backLabel={t("settings.product.action.back")} title={t("settings.product.new.title")} />
        <ProductForm
          cancelHref="/settings/products"
          errorKey="settings.product.message.createError"
          initialValues={initialProductFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/products")}
          status={mutation.status}
          submitKey="settings.product.action.create"
          successKey="settings.product.message.created"
        />
      </div>
    </main>
  );
}
