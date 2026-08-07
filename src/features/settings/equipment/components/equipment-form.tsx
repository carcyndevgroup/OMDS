"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";

import { equipmentCategoryOptions } from "../constants/equipment-options";
import { useEquipmentForm } from "../hooks/use-equipment-form";
import type { EquipmentCategory, EquipmentFormValues } from "../types/equipment";

type EquipmentFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: EquipmentFormValues;
  onSubmit: (values: EquipmentFormValues) => Promise<void>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function EquipmentForm(props: EquipmentFormProps) {
  const { t } = useTranslation();
  const form = useEquipmentForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit()) props.onSuccess?.();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={form.errors.name} label={t("settings.equipment.field.name")} onChange={(value) => form.setField("name", value)} t={t} value={form.values.name} />
        <CrmSelect error={form.errors.category} label={t("settings.equipment.field.category")} onChange={(value) => form.setField("category", value as EquipmentCategory | "")} options={equipmentCategoryOptions} placeholderKey="settings.equipment.placeholder.category" t={t} value={form.values.category} />
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
        {t("settings.equipment.field.active")}
      </label>
      <CrmTextarea label={t("settings.equipment.field.notes")} onChange={(value) => form.setField("notes", value)} placeholder={t("settings.equipment.placeholder.notes")} t={t} value={form.values.notes} />
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("settings.equipment.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={form.isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
