"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import { taxRegimeOptions } from "../constants/sat-catalog-options";
import {
  validateFiscalProfile,
  type SatFiscalProfileErrors,
} from "../schemas/sat-settings-schema";
import type { SatFiscalProfileFormValues } from "../types/sat-settings";

type SatFiscalProfileFormProps = {
  errorKey: TranslationKey;
  initialValues: SatFiscalProfileFormValues;
  onSubmit: (values: SatFiscalProfileFormValues) => Promise<void>;
  onSuccess?: () => void;
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function SatFiscalProfileForm({
  errorKey,
  initialValues,
  onSubmit,
  onSuccess,
  submitKey,
  successKey,
}: SatFiscalProfileFormProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<SatFiscalProfileErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [values, setValues] = useState(initialValues);

  const setField = <TKey extends keyof SatFiscalProfileFormValues>(
    key: TKey,
    value: SatFiscalProfileFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateFiscalProfile(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setStatus("loading");
    try {
      await onSubmit(values);
      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={errors.label} label={t("satFacturas.settings.field.label")} onChange={(value) => setField("label", value)} t={t} value={values.label} />
        <CrmTextInput error={errors.legalName} label={t("satFacturas.settings.field.legalName")} onChange={(value) => setField("legalName", value)} t={t} value={values.legalName} />
        <CrmTextInput error={errors.rfc} label={t("satFacturas.field.rfc")} onChange={(value) => setField("rfc", value)} t={t} value={values.rfc} />
        <CrmSelect error={errors.taxRegime} label={t("satFacturas.field.taxRegime")} onChange={(value) => setField("taxRegime", value)} options={taxRegimeOptions} t={t} value={values.taxRegime} />
        <CrmTextInput label={t("satFacturas.settings.field.constancia")} onChange={(value) => setField("constanciaFileUrl", value)} placeholder={t("satFacturas.settings.placeholder.fileUrl")} t={t} value={values.constanciaFileUrl} />
        <CrmTextInput label={t("satFacturas.settings.field.opinion")} onChange={(value) => setField("opinionFileUrl", value)} placeholder={t("satFacturas.settings.placeholder.fileUrl")} t={t} value={values.opinionFileUrl} />
        <CrmTextInput label={t("satFacturas.settings.field.opinionExpiresAt")} onChange={(value) => setField("opinionExpiresAt", value)} t={t} type="date" value={values.opinionExpiresAt} />
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input checked={values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => setField("isActive", event.target.checked)} type="checkbox" />
        {t("satFacturas.settings.field.active")}
      </label>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {status === "success" ? <span className="text-emerald-300">{t(successKey)}</span> : null}
          {status === "error" ? <span className="text-rose-300">{t(errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href="/sat-facturas/settings">{t("common.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={status === "loading"} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
