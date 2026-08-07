"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { InvoiceCreateInput } from "../../invoice/types/invoice";
import type { Translate } from "../../shared/types/form-types";

type ClientInvoiceCreateModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onCreate: (input: InvoiceCreateInput) => Promise<void>;
  t: Translate;
};

export function ClientInvoiceCreateModal(props: ClientInvoiceCreateModalProps) {
  const { isSaving, onClose, onCreate, t } = props;
  const [title, setTitle] = useState("");
  const [amountMxn, setAmountMxn] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isTaxable, setIsTaxable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedAmount = amountMxn.trim();

    if (!trimmedTitle || !trimmedAmount) {
      setError(t("crm.client.detail.modal.invoiceCreate.validation.required"));
      return;
    }

    const amount = Number(trimmedAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("crm.client.detail.modal.invoiceCreate.validation.amount"));
      return;
    }

    setError(null);
    await onCreate({
      amountMxn: amount.toFixed(2),
      dueAt: dueAt || null,
      isTaxable,
      notes: notes.trim(),
      title: trimmedTitle,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        className="w-full max-w-xl space-y-4 rounded-md border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h3 className="text-lg font-bold text-white">
            {t("crm.client.detail.modal.invoiceCreate.title")}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {t("crm.client.detail.modal.invoiceCreate.description")}
          </p>
        </div>

        <label className="block text-sm font-bold text-zinc-300">
          {t("crm.client.detail.modal.invoiceCreate.field.title")}
          <input
            className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-zinc-300">
            {t("crm.client.detail.modal.invoiceCreate.field.amount")}
            <input
              className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
              inputMode="decimal"
              onChange={(event) => setAmountMxn(event.target.value)}
              placeholder="0.00"
              value={amountMxn}
            />
          </label>

          <label className="block text-sm font-bold text-zinc-300">
            {t("crm.client.detail.modal.invoiceCreate.field.dueDate")}
            <input
              className="mt-2 h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300"
              onChange={(event) => setDueAt(event.target.value)}
              type="date"
              value={dueAt}
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-zinc-300">
          {t("crm.client.detail.modal.invoiceCreate.field.notes")}
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            onChange={(event) => setNotes(event.target.value)}
            value={notes}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            checked={isTaxable}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
            onChange={(event) => setIsTaxable(event.target.checked)}
            type="checkbox"
          />
          {t("crm.client.detail.modal.invoiceCreate.field.taxable")}
        </label>

        {error ? (
          <p className="rounded-md border border-rose-800/70 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200"
            onClick={onClose}
            type="button"
          >
            {t("crm.client.detail.modal.invoiceCreate.action.cancel")}
          </button>
          <button
            className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {t("crm.client.detail.modal.invoiceCreate.action.create")}
          </button>
        </div>
      </form>
    </div>
  );
}