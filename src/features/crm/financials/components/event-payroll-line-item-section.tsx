"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import type { Translate } from "../../shared/types/form-types";
import type { EventPayrollLineItem, EventPayrollLineItemFormValues } from "../types/event-payroll-line-item";
import { EventPayrollLineItemCard } from "./event-payroll-line-item-card";
import { EventPayrollLineItemForm } from "./event-payroll-line-item-form";

type EventPayrollLineItemSectionProps = {
  hasError: boolean;
  isLoading: boolean;
  lineItems: EventPayrollLineItem[];
  onApprove: (lineItemId: string) => Promise<void>;
  onRemove: (lineItemId: string) => Promise<void>;
  onSave: (values: EventPayrollLineItemFormValues, lineItemId?: string) => Promise<void>;
  t: Translate;
};

export function EventPayrollLineItemSection({
  hasError,
  isLoading,
  lineItems,
  onApprove,
  onRemove,
  onSave,
  t,
}: EventPayrollLineItemSectionProps) {
  const [editingItem, setEditingItem] = useState<EventPayrollLineItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const closeForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const save = async (values: EventPayrollLineItemFormValues, lineItemId?: string) => {
    await onSave(values, lineItemId);
    closeForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-zinc-500">{t("crm.payroll.total")}</span>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={() => setIsFormOpen(true)} type="button">
          <Plus aria-hidden="true" size={16} />
          {t("crm.payroll.action.add")}
        </button>
      </div>
      {isFormOpen ? (
        <EventPayrollLineItemForm
          editingItem={editingItem}
          onCancel={closeForm}
          onSave={save}
          t={t}
        />
      ) : null}
      {isLoading ? <p className="text-sm text-zinc-500">{t("crm.payroll.loading")}</p> : null}
      {hasError ? <p className="text-sm text-rose-300">{t("crm.payroll.loadError")}</p> : null}
      {!isLoading && !lineItems.length ? <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">{t("crm.payroll.empty")}</p> : null}
      <div className="grid gap-3">
        {lineItems.map((item) => (
          <EventPayrollLineItemCard
            item={item}
            key={item.id}
            onApprove={onApprove}
            onEdit={(lineItem) => { setEditingItem(lineItem); setIsFormOpen(true); }}
            onRemove={onRemove}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
