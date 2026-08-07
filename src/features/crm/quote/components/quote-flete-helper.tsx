"use client";

import { Plus, Truck } from "lucide-react";

import { useTravelSettings } from "@/features/settings/travel/hooks/use-travel-settings";
import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteAddManualItemValues } from "../types/quote";

type QuoteFleteHelperProps = {
  distanceFromHqKm: number | null;
  onAdd: (values: QuoteAddManualItemValues) => Promise<void>;
  t: Translate;
};

const money = (value: number) =>
  `MXN ${new Intl.NumberFormat("en-US", {
    currency: "MXN",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value)}`;

const numberValue = (value: string | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function QuoteFleteHelper({
  distanceFromHqKm,
  onAdd,
  t,
}: QuoteFleteHelperProps) {
  const { hasError, isLoading, settings } = useTravelSettings();
  const distance = Number(distanceFromHqKm ?? 0);
  const baseFee = numberValue(settings?.baseFeeMxnPerKm);
  const fuelConsumption = numberValue(settings?.fuelConsumptionLPer100Km);
  const fuelPrice = numberValue(settings?.fuelPriceMxnPerLiter);
  const suggestedFee = Math.max(distance * baseFee, 0);
  const estimatedCog = Math.max(distance * (fuelConsumption / 100) * fuelPrice, 0);
  const canAdd = Boolean(settings && distance > 0 && suggestedFee > 0);

  const addFlete = async () => {
    if (!canAdd) return;

    await onAdd({
      cogMxn: estimatedCog.toFixed(2),
      description: t("crm.quote.flete.description"),
      details: [
        `${t("crm.quote.flete.detail.distance")}: ${distance.toFixed(1)} ${t("crm.quote.flete.detail.km")}`,
        `${t("crm.quote.flete.detail.baseFee")}: ${money(baseFee)}/${t("crm.quote.flete.detail.km")}`,
        `${t("crm.quote.flete.detail.fuelCog")}: ${money(estimatedCog)}`,
      ].join(". "),
      isTaxable: true,
      quantity: "1",
      unitPriceMxn: suggestedFee.toFixed(2),
    });
  };

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-950 text-cyan-200">
            <Truck aria-hidden="true" size={20} />
          </span>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              {t("crm.quote.flete.title")}
            </h4>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              {t("crm.quote.flete.subtitle")}
            </p>
          </div>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-700 px-4 text-sm font-bold text-cyan-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600"
          disabled={!canAdd}
          onClick={addFlete}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          {t("crm.quote.flete.action.add")}
        </button>
      </div>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <Metric
          label={t("crm.quote.flete.suggestedFee")}
          value={canAdd ? money(suggestedFee) : t("crm.quote.flete.unavailable")}
        />
        <Metric
          label={t("crm.quote.flete.estimatedCog")}
          value={canAdd ? money(estimatedCog) : t("crm.quote.flete.unavailable")}
        />
      </div>
      {!distance ? (
        <p className="mt-3 text-xs font-bold text-amber-200">
          {t("crm.quote.flete.distanceMissing")}
        </p>
      ) : null}
      {hasError || (!isLoading && !settings) ? (
        <p className="mt-3 text-xs font-bold text-rose-300">
          {t("crm.quote.flete.settingsMissing")}
        </p>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-zinc-100">{value}</p>
    </div>
  );
}
