"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";

import {
  finalDueRuleOptions,
  retainerDueRuleOptions,
} from "../constants/payment-plan-options";
import { usePaymentPlanForm } from "../hooks/use-payment-plan-form";
import type {
  FinalDueRule,
  PaymentPlanFormValues,
  RetainerDueRule,
} from "../types/payment-plan";

type PaymentPlanFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: PaymentPlanFormValues;
  onSubmit: (values: PaymentPlanFormValues) => Promise<void>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function PaymentPlanForm(props: PaymentPlanFormProps) {
  const { t } = useTranslation();
  const form = usePaymentPlanForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit()) props.onSuccess?.();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <CrmTextInput error={form.errors.name} label={t("settings.paymentPlan.field.name")} onChange={(value) => form.setField("name", value)} t={t} value={form.values.name} />
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={form.errors.retainerPercent} label={t("settings.paymentPlan.field.retainerPercent")} onChange={(value) => form.setField("retainerPercent", value)} t={t} type="number" value={form.values.retainerPercent} />
        <CrmTextInput error={form.errors.finalPaymentPercent} label={t("settings.paymentPlan.field.finalPaymentPercent")} onChange={(value) => form.setField("finalPaymentPercent", value)} t={t} type="number" value={form.values.finalPaymentPercent} />
        <CrmSelect label={t("settings.paymentPlan.field.retainerDueRule")} onChange={(value) => form.setField("retainerDueRule", value as RetainerDueRule)} options={retainerDueRuleOptions} t={t} value={form.values.retainerDueRule} />
        <CrmTextInput error={form.errors.retainerGracePeriodDays} label={t("settings.paymentPlan.field.retainerGracePeriodDays")} onChange={(value) => form.setField("retainerGracePeriodDays", value)} t={t} type="number" value={form.values.retainerGracePeriodDays} />
        <CrmSelect label={t("settings.paymentPlan.field.finalDueRule")} onChange={(value) => form.setField("finalDueRule", value as FinalDueRule)} options={finalDueRuleOptions} t={t} value={form.values.finalDueRule} />
        {form.values.finalDueRule === "days_before_event" ? (
          <CrmTextInput error={form.errors.finalDueDaysBeforeEvent} label={t("settings.paymentPlan.field.finalDueDaysBeforeEvent")} onChange={(value) => form.setField("finalDueDaysBeforeEvent", value)} t={t} type="number" value={form.values.finalDueDaysBeforeEvent} />
        ) : null}
      </div>
      <CrmTextarea label={t("settings.paymentPlan.field.refundNotes")} onChange={(value) => form.setField("refundNotes", value)} placeholder={t("settings.paymentPlan.placeholder.refundNotes")} t={t} value={form.values.refundNotes} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.allowAdjustedFinalBalance} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("allowAdjustedFinalBalance", event.target.checked)} type="checkbox" />
          {t("settings.paymentPlan.field.allowAdjustedFinalBalance")}
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isDefault} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isDefault", event.target.checked)} type="checkbox" />
          {t("settings.paymentPlan.field.isDefault")}
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
          {t("settings.paymentPlan.field.active")}
        </label>
      </div>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("settings.paymentPlan.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={form.isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
