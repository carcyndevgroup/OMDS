"use client";

import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import { useExpenseCategories } from "../hooks/use-expense-categories";
import { useExpenseCategoryMutation } from "../hooks/use-expense-category-mutation";
import {
  initialExpenseCategoryValues,
  validateExpenseCategory,
  type ExpenseCategoryErrors,
} from "../schemas/expense-category-schema";
import type {
  ExpenseCategory,
  ExpenseCategoryFormValues,
} from "../types/expense-category";

const valuesFromCategory = (
  category: ExpenseCategory,
): ExpenseCategoryFormValues => ({
  isActive: category.isActive,
  name: category.name,
  sortOrder: category.sortOrder,
});

export function ExpenseCategoryList() {
  const { t } = useTranslation();
  const categoryState = useExpenseCategories();
  const mutation = useExpenseCategoryMutation();
  const [editingId, setEditingId] = useState<string | undefined>();
  const [errors, setErrors] = useState<ExpenseCategoryErrors>({});
  const [values, setValues] = useState(initialExpenseCategoryValues);

  const setField = (field: keyof ExpenseCategoryFormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setEditingId(undefined);
    setErrors({});
    setValues(initialExpenseCategoryValues);
  };

  const save = async () => {
    const validation = validateExpenseCategory(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await mutation.save(values, editingId);
    reset();
    await categoryState.refresh();
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("settings.expense.action.back")}
            </Link>
            <h1 className="mt-3 text-4xl font-black">{t("settings.expense.title")}</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.expense.subtitle")}</p>
          </div>
        </header>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_160px_auto] md:items-end">
            <CrmTextInput error={errors.name} label={t("settings.expense.field.name")} onChange={(value) => setField("name", value)} t={t} value={values.name} />
            <CrmTextInput error={errors.sortOrder} label={t("settings.expense.field.sortOrder")} onChange={(value) => setField("sortOrder", value)} t={t} type="number" value={values.sortOrder} />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={save} type="button">
              <Plus aria-hidden="true" size={16} />
              {t("settings.expense.action.save")}
            </button>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm font-bold text-zinc-200">
            <input checked={values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => setField("isActive", event.target.checked)} type="checkbox" />
            {t("settings.expense.field.active")}
          </label>
        </section>

        {categoryState.isLoading ? <p className="text-sm text-zinc-500">{t("settings.expense.loading")}</p> : null}
        {categoryState.hasError ? <p className="text-sm text-rose-300">{t("settings.expense.loadError")}</p> : null}
        <section className="grid gap-3">
          {categoryState.categories.map((category) => (
            <article className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-900 p-4" key={category.id}>
              <div>
                <p className="font-bold text-cyan-200">{category.name}</p>
                <p className="text-sm text-zinc-500">{category.isActive ? t("settings.expense.status.active") : t("settings.expense.status.inactive")}</p>
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => { setEditingId(category.id); setValues(valuesFromCategory(category)); }} type="button">
                <Pencil aria-hidden="true" size={16} />
                {t("settings.expense.action.edit")}
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
