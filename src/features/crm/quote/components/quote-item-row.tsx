"use client";

import { ArrowDown, ArrowUp, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import type { Translate } from "@/features/crm/shared/types/form-types";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type {
  QuoteItem,
  QuoteMoveDirection,
  QuoteUpdateItemValues,
} from "../types/quote";

type QuoteItemRowProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  item: QuoteItem;
  onMove: (itemId: string, direction: QuoteMoveDirection) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onUpdate: (itemId: string, values: QuoteUpdateItemValues) => Promise<void>;
  readOnly: boolean;
  t: Translate;
};

const toValues = (item: QuoteItem): QuoteUpdateItemValues => ({
  cogMxn: item.cogMxn,
  description: item.description,
  details: item.details,
  isTaxable: item.isTaxable,
  quantity: item.quantity,
  unitPriceMxn: item.unitPriceMxn,
});

export function QuoteItemRow(props: QuoteItemRowProps) {
  const { canMoveDown, canMoveUp, item, onMove, onRemove, onUpdate, readOnly, t } = props;
  const [values, setValues] = useState<QuoteUpdateItemValues>(toValues(item));

  const setValue = <TKey extends keyof QuoteUpdateItemValues>(
    key: TKey,
    value: QuoteUpdateItemValues[TKey],
  ) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_8rem_8rem_8rem]">
        <CrmTextInput
          label={t("crm.quote.field.description")}
          disabled={readOnly}
          onChange={(value) => setValue("description", value)}
          t={t}
          value={values.description}
        />
        <CrmTextInput
          label={t("crm.quote.field.quantity")}
          disabled={readOnly}
          onChange={(value) => setValue("quantity", value)}
          t={t}
          type="number"
          value={values.quantity}
        />
        <CrmTextInput
          label={t("crm.quote.field.unitPriceMxn")}
          disabled={readOnly}
          onChange={(value) => setValue("unitPriceMxn", value)}
          t={t}
          type="number"
          value={values.unitPriceMxn}
        />
        <CrmTextInput
          label={t("crm.quote.field.cogMxn")}
          disabled={readOnly}
          onChange={(value) => setValue("cogMxn", value)}
          t={t}
          type="number"
          value={values.cogMxn}
        />
      </div>
      <CrmTextInput
        label={t("crm.quote.field.details")}
        disabled={readOnly}
        onChange={(value) => setValue("details", value)}
        t={t}
        value={values.details}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300">
          <input
            checked={values.isTaxable}
            className="h-4 w-4 accent-cyan-300"
            disabled={readOnly}
            onChange={(event) => setValue("isTaxable", event.target.checked)}
            type="checkbox"
          />
          {t("crm.quote.field.taxable")}
        </label>
        {!readOnly ? (
          <div className="flex flex-wrap gap-2">
          <IconButton
            disabled={!canMoveUp}
            label={t("crm.quote.action.moveUp")}
            onClick={() => onMove(item.id, "up")}
          >
            <ArrowUp aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            disabled={!canMoveDown}
            label={t("crm.quote.action.moveDown")}
            onClick={() => onMove(item.id, "down")}
          >
            <ArrowDown aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            label={t("crm.quote.action.saveItem")}
            onClick={() => onUpdate(item.id, values)}
          >
            <Save aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            label={t("crm.quote.action.removeItem")}
            onClick={() => onRemove(item.id)}
            variant="danger"
          >
            <Trash2 aria-hidden="true" size={15} />
          </IconButton>
          </div>
        ) : null}
      </div>
      <p className="text-right text-sm font-bold text-cyan-200">
        {t("crm.quote.total.line")}: {formatMoneyMxn(item.lineTotalMxn)}
      </p>
    </div>
  );
}

function IconButton(props: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  variant?: "danger" | "normal";
}) {
  const { children, disabled = false, label, onClick, variant = "normal" } = props;
  const danger = variant === "danger";

  return (
    <button
      aria-label={label}
      className={[
        "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "border-rose-400/40 text-rose-200 hover:bg-rose-400/10"
          : "border-zinc-700 text-zinc-300 hover:border-cyan-300/40 hover:text-cyan-200",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
