"use client";

import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useTranslation } from "@/core/i18n";
import { useSatSettings } from "@/features/sat-facturas/hooks/use-sat-settings";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import {
  brochureBehaviorOptions,
  commissionModelOptions,
  invoiceBehaviorOptions,
  paymentResponsibilityOptions,
  quotePricingModelOptions,
} from "../constants/venue-settings-options";
import { useVenueSettingsMutation } from "../hooks/use-venue-settings-mutation";
import { toVenueSettingsFormValues } from "../schemas/venue-settings-schema";
import type { Venue, VenueSettingsFormValues } from "../types/venue";

type VenueSettingsTabProps = { venue: Venue };

export function VenueSettingsTab({ venue }: VenueSettingsTabProps) {
  const { t } = useTranslation();
  const satSettings = useSatSettings();
  const [values, setValues] = useState(() => toVenueSettingsFormValues(venue));
  const mutation = useVenueSettingsMutation(venue.id);
  const fiscalProfileOptions = (satSettings.settings?.fiscalProfiles ?? [])
    .filter((profile) => profile.isActive || profile.id === values.fiscalDefaultProfileId)
    .map((profile) => ({
      label: `${profile.label} - ${profile.rfc || t("common.notProvided")}`,
      value: profile.id,
    }));
  const bankAccountOptions = (satSettings.settings?.bankAccounts ?? [])
    .filter((account) => account.isActive || account.id === values.fiscalDefaultBankAccountId)
    .map((account) => ({
      label: `${account.nickname} - ${account.bankName || t("common.notProvided")}`,
      value: account.id,
    }));

  const setField = <TKey extends keyof VenueSettingsFormValues>(
    key: TKey,
    value: VenueSettingsFormValues[TKey],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutation.mutate(values);
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div>
        <h2 className="text-2xl font-bold">{t("crm.venue.settings.title")}</h2>
        <p className="mt-2 text-sm font-medium text-zinc-500">
          {t("crm.venue.settings.subtitle")}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <CrmSelect label={t("crm.venue.settings.field.paymentResponsibility")} onChange={(value) => setField("paymentResponsibility", value)} options={paymentResponsibilityOptions} t={t} value={values.paymentResponsibility} />
        <CrmSelect label={t("crm.venue.settings.field.facturaRecipient")} onChange={(value) => setField("facturaRecipient", value)} options={paymentResponsibilityOptions} t={t} value={values.facturaRecipient} />
        <CrmSelect label={t("crm.venue.settings.field.quotePricingModel")} onChange={(value) => setField("quotePricingModel", value)} options={quotePricingModelOptions} t={t} value={values.quotePricingModel} />
        <CrmSelect label={t("crm.venue.settings.field.invoiceBehavior")} onChange={(value) => setField("invoiceBehavior", value)} options={invoiceBehaviorOptions} t={t} value={values.invoiceBehavior} />
        <CrmSelect label={t("crm.venue.settings.field.fiscalProfile")} onChange={(value) => setField("fiscalDefaultProfileId", value)} options={fiscalProfileOptions} t={t} value={values.fiscalDefaultProfileId} />
        <CrmSelect label={t("crm.venue.settings.field.bankAccount")} onChange={(value) => setField("fiscalDefaultBankAccountId", value)} options={bankAccountOptions} t={t} value={values.fiscalDefaultBankAccountId} />
        <CrmSelect label={t("crm.venue.settings.field.brochureBehavior")} onChange={(value) => setField("brochureBehavior", value)} options={brochureBehaviorOptions} t={t} value={values.brochureBehavior} />
        <CrmSelect label={t("crm.venue.settings.field.commissionModel")} onChange={(value) => setField("commissionModel", value)} options={commissionModelOptions} t={t} value={values.commissionModel} />
        <CrmTextInput label={t("crm.venue.settings.field.commissionPercentage")} onChange={(value) => setField("commissionPercentage", value)} t={t} type="number" value={values.commissionPercentage} />
        <CrmTextInput label={t("crm.venue.settings.field.commissionFixedAmount")} onChange={(value) => setField("commissionFixedAmount", value)} t={t} type="number" value={values.commissionFixedAmount} />
      </div>

      <label className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 text-sm font-bold text-zinc-200">
        <input
          checked={values.suppressClientInvoice}
          className="mt-1 h-4 w-4 accent-cyan-300"
          onChange={(event) => setField("suppressClientInvoice", event.target.checked)}
          type="checkbox"
        />
        <span>
          {t("crm.venue.settings.field.suppressClientInvoice")}
          <span className="mt-1 block font-medium text-zinc-500">
            {t("crm.venue.settings.help.suppressClientInvoice")}
          </span>
        </span>
      </label>

      <CrmTextarea label={t("crm.venue.settings.field.notes")} onChange={(value) => setField("settingsNotes", value)} placeholder={t("crm.venue.settings.placeholder.notes")} t={t} value={values.settingsNotes} />

      <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-5">
        <p aria-live="polite" className="text-sm font-medium">
          {mutation.status === "success" ? <span className="text-emerald-300">{t("crm.venue.settings.saved")}</span> : null}
          {mutation.status === "error" ? <span className="text-rose-300">{t("crm.venue.settings.error")}</span> : null}
        </p>
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" type="submit">
          <Save aria-hidden="true" size={16} />
          {t("crm.venue.settings.action.save")}
        </button>
      </div>
    </form>
  );
}
