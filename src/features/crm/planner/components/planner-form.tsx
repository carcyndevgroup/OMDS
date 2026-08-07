"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { PhoneInput } from "../../shared/components/phone-input";
import {
  plannerAreaOptions,
  plannerCommissionModelOptions,
  plannerContactMethodOptions,
  plannerStatusOptions,
  pvCommissionPolicyOptions,
} from "../constants/planner-options";
import { usePlannerForm } from "../hooks/use-planner-form";
import type { PlannerFormValues } from "../types/planner";

type PlannerFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: PlannerFormValues;
  onSubmit: (values: PlannerFormValues) => Promise<unknown>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function PlannerForm(props: PlannerFormProps) {
  const { t } = useTranslation();
  const form = usePlannerForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit()) props.onSuccess?.();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={form.errors.name} label={t("crm.planner.field.name")} onChange={(value) => form.setField("name", value)} t={t} value={form.values.name} />
        <CrmTextInput label={t("crm.planner.field.companyName")} onChange={(value) => form.setField("companyName", value)} t={t} value={form.values.companyName} />
        <CrmTextInput label={t("crm.planner.field.email")} onChange={(value) => form.setField("email", value)} t={t} type="email" value={form.values.email} />
        <PhoneInput label={t("crm.planner.field.phone")} onChange={(value) => form.setField("phone", value)} t={t} value={form.values.phone} />
        <PhoneInput label={t("crm.planner.field.whatsapp")} onChange={(value) => form.setField("whatsapp", value)} t={t} value={form.values.whatsapp} />
        <CrmTextInput label={t("crm.planner.field.instagram")} onChange={(value) => form.setField("instagram", value)} t={t} value={form.values.instagram} />
        <CrmTextInput label={t("crm.planner.field.websiteUrl")} onChange={(value) => form.setField("websiteUrl", value)} t={t} type="url" value={form.values.websiteUrl} />
        <CrmSelect label={t("crm.planner.field.preferredMethod")} onChange={(value) => form.setField("preferredContactMethod", value)} options={plannerContactMethodOptions} t={t} value={form.values.preferredContactMethod} />
        <CrmSelect label={t("crm.planner.field.area")} onChange={(value) => form.setField("area", value)} options={plannerAreaOptions} placeholderKey="crm.venue.placeholder.area" t={t} value={form.values.area} />
        <CrmTextInput label={t("crm.planner.field.city")} onChange={(value) => form.setField("city", value)} t={t} value={form.values.city} />
        <CrmSelect label={t("crm.planner.field.status")} onChange={(value) => form.setField("internalStatus", value === "inactive" ? "inactive" : "active")} options={plannerStatusOptions} t={t} value={form.values.internalStatus} />
      </div>

      <div className="grid gap-5 border-t border-zinc-800 pt-5 md:grid-cols-2">
        <CrmSelect label={t("crm.planner.field.commissionModel")} onChange={(value) => form.setField("defaultCommissionModel", value)} options={plannerCommissionModelOptions} t={t} value={form.values.defaultCommissionModel} />
        <CrmTextInput label={t("crm.planner.field.commissionPercentage")} onChange={(value) => form.setField("defaultCommissionPercentage", value)} t={t} type="number" value={form.values.defaultCommissionPercentage} />
        <CrmSelect label={t("crm.planner.field.pvPolicy")} onChange={(value) => form.setField("pvCommissionPolicy", value)} options={pvCommissionPolicyOptions} t={t} value={form.values.pvCommissionPolicy} />
      </div>

      <CrmTextarea label={t("crm.planner.field.notes")} onChange={(value) => form.setField("notes", value)} placeholder={t("crm.planner.placeholder.notes")} t={t} value={form.values.notes} />

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("crm.planner.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={form.isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
