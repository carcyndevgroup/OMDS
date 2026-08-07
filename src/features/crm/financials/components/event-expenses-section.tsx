"use client";

import type { TranslationKey } from "@/core/i18n";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { useExpenseCategories } from "@/features/settings/expense/hooks/use-expense-categories";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import type { Translate } from "../../shared/types/form-types";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import {
  initialEventExpenseValues,
  validateEventExpense,
  type EventExpenseErrors,
} from "../schemas/event-expense-schema";
import type { EventExpense, EventExpenseFormValues } from "../types/event-expense";

type EventExpensesSectionProps = {
  expenses: EventExpense[];
  hasError: boolean;
  isLoading: boolean;
  onRemove: (expenseId: string) => Promise<void>;
  onSave: (values: EventExpenseFormValues, expenseId?: string) => Promise<void>;
  t: Translate;
};

type ExpenseSelectOption = { translationKey: TranslationKey; value: string };

const statusOptions: ExpenseSelectOption[] = [
  { translationKey: "crm.expense.status.estimated", value: "estimated" },
  { translationKey: "crm.expense.status.approved", value: "approved" },
  { translationKey: "crm.expense.status.paid", value: "paid" },
  { translationKey: "crm.expense.status.void", value: "void" },
];

const statusKeys = {
  approved: "crm.expense.status.approved",
  estimated: "crm.expense.status.estimated",
  paid: "crm.expense.status.paid",
  void: "crm.expense.status.void",
} as const;

const valuesFromExpense = (expense: EventExpense): EventExpenseFormValues => ({
  amountMxn: expense.amountMxn,
  categoryId: expense.categoryId,
  description: expense.description,
  notes: expense.notes,
  status: expense.status,
  vendorName: expense.vendorName,
});

export function EventExpensesSection({
  expenses,
  hasError,
  isLoading,
  onRemove,
  onSave,
  t,
}: EventExpensesSectionProps) {
  const categories = useExpenseCategories();
  const [editingId, setEditingId] = useState<string | undefined>();
  const [errors, setErrors] = useState<EventExpenseErrors>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [values, setValues] = useState(initialEventExpenseValues);
  const categoryOptions = categories.categories
    .filter((category) => category.isActive)
    .map((category) => ({ label: category.name, value: category.id }));

  const setField = (field: keyof EventExpenseFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setEditingId(undefined);
    setErrors({});
    setIsFormOpen(false);
    setValues(initialEventExpenseValues);
  };

  const submit = async () => {
    const validation = validateEventExpense(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await onSave(values, editingId);
    reset();
  };

  const edit = (expense: EventExpense) => {
    setEditingId(expense.id);
    setValues(valuesFromExpense(expense));
    setErrors({});
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-zinc-500">{t("crm.expense.total")}</span>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={() => setIsFormOpen(true)} type="button">
          <Plus aria-hidden="true" size={16} />
          {t("crm.expense.action.add")}
        </button>
      </div>
      {isFormOpen ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CrmTextInput error={errors.description} label={t("crm.expense.field.description")} onChange={(value) => setField("description", value)} t={t} value={values.description} />
            <CrmSelect label={t("crm.expense.field.category")} onChange={(value) => setField("categoryId", value)} options={categoryOptions} placeholderKey="crm.expense.placeholder.category" t={t} value={values.categoryId} />
            <CrmTextInput label={t("crm.expense.field.vendor")} onChange={(value) => setField("vendorName", value)} t={t} value={values.vendorName} />
            <CrmTextInput error={errors.amountMxn} label={t("crm.expense.field.amount")} onChange={(value) => setField("amountMxn", value)} t={t} type="number" value={values.amountMxn} />
            <CrmSelect label={t("crm.expense.field.status")} onChange={(value) => setField("status", value)} options={statusOptions} t={t} value={values.status} />
          </div>
          <div className="mt-4">
            <CrmTextarea label={t("crm.expense.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("crm.expense.placeholder.notes")} t={t} value={values.notes} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={submit} type="button">{t("crm.expense.action.save")}</button>
            <button className="h-11 rounded-md border border-zinc-700 px-5 text-sm font-bold text-zinc-200" onClick={reset} type="button">{t("crm.expense.action.cancel")}</button>
          </div>
        </div>
      ) : null}
      {isLoading || categories.isLoading ? <p className="text-sm text-zinc-500">{t("crm.expense.loading")}</p> : null}
      {hasError || categories.hasError ? <p className="text-sm text-rose-300">{t("crm.expense.loadError")}</p> : null}
      {!isLoading && !expenses.length ? <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">{t("crm.expense.empty")}</p> : null}
      <div className="grid gap-3">
        {expenses.map((expense) => (
          <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={expense.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold text-cyan-200">{expense.description}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{expense.categoryName || t("crm.expense.field.category")} · {t(statusKeys[expense.status])}</p>
              </div>
              <p className="text-lg font-black text-white">{formatMoneyMxn(expense.amountMxn)}</p>
            </div>
            {expense.vendorName ? <p className="mt-2 text-sm text-zinc-400">{expense.vendorName}</p> : null}
            {expense.notes ? <p className="mt-2 text-sm text-zinc-500">{expense.notes}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => edit(expense)} type="button">
                <Pencil aria-hidden="true" size={16} />
                {t("crm.expense.action.edit")}
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-400/40 px-3 text-sm font-bold text-rose-200" onClick={() => onRemove(expense.id)} type="button">
                <Trash2 aria-hidden="true" size={16} />
                {t("crm.expense.action.remove")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
