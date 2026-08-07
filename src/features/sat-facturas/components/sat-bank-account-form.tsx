"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import { useSatSettings } from "../hooks/use-sat-settings";
import {
  validateBankAccount,
  type SatBankAccountErrors,
} from "../schemas/sat-settings-schema";
import type { SatBankAccountFormValues } from "../types/sat-settings";

type SatBankAccountFormProps = {
  errorKey: TranslationKey;
  initialValues: SatBankAccountFormValues;
  onSubmit: (values: SatBankAccountFormValues) => Promise<void>;
  onSuccess?: () => void;
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

const currencyOptions = [
  { label: "MXN", value: "mxn" },
  { label: "USD", value: "usd" },
];

export function SatBankAccountForm(props: SatBankAccountFormProps) {
  const { t } = useTranslation();
  const settings = useSatSettings();
  const [errors, setErrors] = useState<SatBankAccountErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [values, setValues] = useState(props.initialValues);

  const profileOptions = (settings.settings?.fiscalProfiles ?? []).map((profile) => ({
    label: `${profile.label} - ${profile.rfc || t("common.notProvided")}`,
    value: profile.id,
  }));

  const setField = <TKey extends keyof SatBankAccountFormValues>(
    key: TKey,
    value: SatBankAccountFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateBankAccount(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setStatus("loading");
    try {
      await props.onSubmit(values);
      setStatus("success");
      props.onSuccess?.();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={errors.nickname} label={t("satFacturas.settings.field.nickname")} onChange={(value) => setField("nickname", value)} t={t} value={values.nickname} />
        <CrmTextInput error={errors.bankName} label={t("satFacturas.settings.field.bankName")} onChange={(value) => setField("bankName", value)} t={t} value={values.bankName} />
        <CrmTextInput error={errors.clabe} label={t("satFacturas.settings.field.clabe")} onChange={(value) => setField("clabe", value)} t={t} value={values.clabe} />
        <CrmTextInput label={t("satFacturas.settings.field.accountNumber")} onChange={(value) => setField("accountNumber", value)} t={t} value={values.accountNumber} />
        <CrmSelect label={t("satFacturas.settings.field.profile")} onChange={(value) => setField("fiscalProfileId", value)} options={profileOptions} t={t} value={values.fiscalProfileId} />
        <CrmTextInput error={errors.beneficiaryName} label={t("satFacturas.settings.field.beneficiary")} onChange={(value) => setField("beneficiaryName", value)} t={t} value={values.beneficiaryName} />
        <CrmSelect error={errors.currency} label={t("satFacturas.settings.field.currency")} onChange={(value) => setField("currency", value)} options={currencyOptions} t={t} value={values.currency} />
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input checked={values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => setField("isActive", event.target.checked)} type="checkbox" />
        {t("satFacturas.settings.field.active")}
      </label>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href="/sat-facturas/settings">{t("common.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={status === "loading"} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
