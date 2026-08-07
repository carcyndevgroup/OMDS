"use client";

import { ArrowLeft, Save, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import { useTravelSettings } from "../hooks/use-travel-settings";
import { useTravelSettingsMutation } from "../hooks/use-travel-settings-mutation";
import {
  initialTravelSettings,
  validateTravelSettings,
  type TravelSettingsErrors,
} from "../schemas/travel-settings-schema";
import type { TravelSettings } from "../types/travel-settings";

export function TravelSettingsPage() {
  const { t } = useTranslation();
  const settingsState = useTravelSettings();
  const mutation = useTravelSettingsMutation();
  const [errors, setErrors] = useState<TravelSettingsErrors>({});
  const [values, setValues] = useState(initialTravelSettings);

  useEffect(() => {
    if (settingsState.settings) setValues(settingsState.settings);
  }, [settingsState.settings]);

  const setField = (field: keyof TravelSettings, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    const validation = validateTravelSettings(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await mutation.save(values);
    await settingsState.refresh();
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
          <ArrowLeft aria-hidden="true" size={18} />
          {t("settings.travel.action.back")}
        </Link>
        <header>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
              <Truck aria-hidden="true" size={24} />
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {t("settings.travel.title")}
            </h1>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            {t("settings.travel.subtitle")}
          </p>
        </header>

        <section className="rounded-md border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-xl font-bold">{t("settings.travel.card.title")}</h2>
          </div>
          <div className="space-y-5 p-5">
            {settingsState.isLoading ? (
              <p className="text-sm text-zinc-500">{t("settings.travel.loading")}</p>
            ) : null}
            {settingsState.hasError ? (
              <p className="text-sm text-rose-300">{t("settings.travel.loadError")}</p>
            ) : null}
            <CrmTextInput error={errors.hqAddress} label={t("settings.travel.field.hqAddress")} onChange={(value) => setField("hqAddress", value)} t={t} value={values.hqAddress} />
            <div className="grid gap-4 md:grid-cols-3">
              <CrmTextInput error={errors.fuelConsumptionLPer100Km} label={t("settings.travel.field.fuelConsumptionLPer100Km")} onChange={(value) => setField("fuelConsumptionLPer100Km", value)} t={t} type="number" value={values.fuelConsumptionLPer100Km} />
              <CrmTextInput error={errors.fuelPriceMxnPerLiter} label={t("settings.travel.field.fuelPriceMxnPerLiter")} onChange={(value) => setField("fuelPriceMxnPerLiter", value)} t={t} type="number" value={values.fuelPriceMxnPerLiter} />
              <CrmTextInput error={errors.baseFeeMxnPerKm} label={t("settings.travel.field.baseFeeMxnPerKm")} onChange={(value) => setField("baseFeeMxnPerKm", value)} t={t} type="number" value={values.baseFeeMxnPerKm} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
              {mutation.status === "success" ? (
                <p className="text-sm font-bold text-cyan-200">{t("settings.travel.message.success")}</p>
              ) : <span />}
              {mutation.status === "error" ? (
                <p className="text-sm font-bold text-rose-300">{t("settings.travel.message.error")}</p>
              ) : null}
              <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={save} type="button">
                <Save aria-hidden="true" size={17} />
                {t("settings.travel.action.save")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
