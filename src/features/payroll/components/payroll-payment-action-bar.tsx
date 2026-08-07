"use client";

import { AlertTriangle, Banknote } from "lucide-react";
import { useState } from "react";

import type { TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import type { Translate } from "@/features/crm/shared/types/form-types";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import type { PayrollPaymentFormValues } from "../types/payroll";

type PayrollPaymentActionBarProps = {
  defaultReceivingAccount: string;
  hasMissingReceivingAccount: boolean;
  isDisabled: boolean;
  onRecord: (values: PayrollPaymentFormValues) => Promise<void>;
  selectedCount: number;
  selectedTotalMxn: string;
  t: Translate;
};

const methodOptions: { translationKey: TranslationKey; value: string }[] = [
  { translationKey: "payroll.payment.method.spei", value: "spei" },
  { translationKey: "payroll.payment.method.cash", value: "cash" },
];

const currencyOptions: { translationKey: TranslationKey; value: string }[] = [
  { translationKey: "payroll.payment.currency.mxn", value: "mxn" },
  { translationKey: "payroll.payment.currency.usd", value: "usd" },
];

const nowInputValue = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export function PayrollPaymentActionBar({
  defaultReceivingAccount,
  hasMissingReceivingAccount,
  isDisabled,
  onRecord,
  selectedCount,
  selectedTotalMxn,
  t,
}: PayrollPaymentActionBarProps) {
  const [values, setValues] = useState<PayrollPaymentFormValues>({
    bonusMxn: "0",
    cashCurrency: "mxn",
    notes: "",
    paidAt: nowInputValue(),
    paymentMethod: "spei",
    receiptFileUrl: "",
    receivingAccount: defaultReceivingAccount,
    sendingAccount: "",
    transactionId: "",
  });

  const setField = (field: keyof PayrollPaymentFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="sticky top-4 z-10 rounded-md border border-emerald-300/40 bg-zinc-950/95 p-4 shadow-xl shadow-black/30">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
            {t("payroll.payment.selected")}
          </p>
          <p className="mt-1 text-xl font-black text-emerald-200">
            {selectedCount} · {formatMoneyMxn(selectedTotalMxn)}
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-300 px-5 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isDisabled}
          onClick={() => onRecord(values)}
          type="button"
        >
          <Banknote aria-hidden="true" size={18} />
          {t("payroll.payment.record")}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <CrmSelect label={t("payroll.payment.field.method")} onChange={(value) => setField("paymentMethod", value)} options={methodOptions} t={t} value={values.paymentMethod} />
        {values.paymentMethod === "cash" ? (
          <CrmSelect label={t("payroll.payment.field.cashCurrency")} onChange={(value) => setField("cashCurrency", value)} options={currencyOptions} t={t} value={values.cashCurrency} />
        ) : null}
        <CrmTextInput label={t("payroll.payment.field.paidAt")} onChange={(value) => setField("paidAt", value)} t={t} type="datetime-local" value={values.paidAt} />
        <CrmTextInput label={t("payroll.payment.field.sendingAccount")} onChange={(value) => setField("sendingAccount", value)} t={t} value={values.sendingAccount} />
        <CrmTextInput label={t("payroll.payment.field.receivingAccount")} onChange={(value) => setField("receivingAccount", value)} t={t} value={values.receivingAccount} />
        <CrmTextInput label={t("payroll.payment.field.transactionId")} onChange={(value) => setField("transactionId", value)} t={t} value={values.transactionId} />
        <CrmTextInput label={t("payroll.payment.field.receiptFileUrl")} onChange={(value) => setField("receiptFileUrl", value)} t={t} value={values.receiptFileUrl} />
        <CrmTextInput label={t("payroll.payment.field.bonus")} onChange={(value) => setField("bonusMxn", value)} t={t} type="number" value={values.bonusMxn} />
      </div>
      {values.paymentMethod === "spei" && hasMissingReceivingAccount ? (
        <p className="mt-4 flex items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-200">
          <AlertTriangle aria-hidden="true" size={17} />
          {t("payroll.warning.missingBank")}
        </p>
      ) : null}
      <div className="mt-4">
        <CrmTextarea label={t("payroll.payment.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("payroll.payment.placeholder.notes")} t={t} value={values.notes} />
      </div>
    </section>
  );
}
