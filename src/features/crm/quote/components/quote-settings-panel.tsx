"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteUpdateVersionValues, QuoteVersion } from "../types/quote";
import {
  CheckboxField,
  Field,
  NumberField,
  SelectField,
  SettingsDivider,
} from "./quote-settings-fields";

type ExchangeRateStatus = "idle" | "loading" | "success" | "error";

type QuoteSettingsPanelProps = {
  onUpdate: (values: QuoteUpdateVersionValues) => Promise<void>;
  readOnly: boolean;
  t: Translate;
  version: QuoteVersion;
};

export function QuoteSettingsPanel(props: QuoteSettingsPanelProps) {
  const { onUpdate, readOnly, t, version } = props;
  const [rateStatus, setRateStatus] = useState<ExchangeRateStatus>("idle");
  const [values, setValues] = useState(() => toValues(version));

  useEffect(() => setValues(toValues(version)), [version]);

  const setField = (key: keyof QuoteUpdateVersionValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };
  const setBooleanField = (key: keyof QuoteUpdateVersionValues, value: boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!readOnly) await onUpdate(values);
  };

  const fetchBanxicoRate = async () => {
    setRateStatus("loading");
    let response: Response;
    try {
      response = await fetch("/api/exchange-rates/banxico", {
        cache: "no-store",
      });
    } catch {
      setRateStatus("error");
      return;
    }

    if (!response.ok) {
      setRateStatus("error");
      return;
    }

    const payload = (await response.json()) as {
      data?: { rate?: string };
    };
    const rate = payload.data?.rate;

    if (!rate) {
      setRateStatus("error");
      return;
    }

    setValues((current) => ({ ...current, exchangeRateToMxn: rate }));
    setRateStatus("success");
  };

  return (
    <form
      className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4"
      onSubmit={submit}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500">
          {t("crm.quote.settings.title")}
        </h4>
        {!readOnly ? (
          <button
            className="rounded-md border border-cyan-300/40 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300 hover:text-zinc-950"
            type="submit"
          >
            {t("crm.quote.action.saveSettings")}
          </button>
        ) : null}
      </div>
      <div className="space-y-4">
        <Field label={t("crm.quote.field.expiresAt")} onChange={(value) => setField("expiresAt", value)} readOnly={readOnly} type="date" value={values.expiresAt} />
        <SettingsDivider />
        <div className="grid gap-3 md:grid-cols-2">
        <SelectField label={t("crm.quote.field.displayCurrency")} onChange={(value) => setField("displayCurrency", value)} readOnly={readOnly} value={values.displayCurrency}>
          <option value="mxn">{t("crm.quote.currency.mxn")}</option>
          <option value="usd">{t("crm.quote.currency.usd")}</option>
          <option value="cad">{t("crm.quote.currency.cad")}</option>
        </SelectField>
        <div className="grid gap-2">
          <NumberField label={t("crm.quote.field.exchangeRate")} onChange={(value) => setField("exchangeRateToMxn", value)} readOnly={readOnly} value={values.exchangeRateToMxn} />
          {!readOnly ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-md border border-cyan-300/40 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={rateStatus === "loading"}
                onClick={fetchBanxicoRate}
                type="button"
              >
                {rateStatus === "loading"
                  ? t("crm.quote.action.fetchRateLoading")
                  : t("crm.quote.action.fetchBanxicoRate")}
              </button>
              {rateStatus === "success" ? (
                <p className="text-xs font-bold text-cyan-200">
                  {t("crm.quote.exchangeRate.banxicoLoaded")}
                </p>
              ) : null}
              {rateStatus === "error" ? (
                <p className="text-xs font-bold text-rose-300">
                  {t("crm.quote.exchangeRate.banxicoError")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="grid gap-2">
          <NumberField label={t("crm.quote.field.exchangeMargin")} onChange={(value) => setField("exchangeRateMarginPercent", value)} readOnly={readOnly} value={values.exchangeRateMarginPercent} />
          <CheckboxField
            checked={values.applyExchangeRateMargin}
            label={t("crm.quote.field.applyExchangeMargin")}
            onChange={(value) => setBooleanField("applyExchangeRateMargin", value)}
            readOnly={readOnly}
          />
        </div>
      </div>
        <SettingsDivider />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label={t("crm.quote.field.discountType")} onChange={(value) => setField("discountType", value)} readOnly={readOnly} value={values.discountType}>
            <option value="amount">{t("crm.quote.discount.amount")}</option>
            <option value="percent">{t("crm.quote.discount.percent")}</option>
          </SelectField>
          <NumberField label={t("crm.quote.field.discountValue")} onChange={(value) => setField("discountValueMxn", value)} readOnly={readOnly} value={values.discountValueMxn} />
        </div>
        <SettingsDivider />
        <div className="grid gap-3">
          <CheckboxField
            checked={values.appliesIvaTax}
            label={t("crm.quote.field.appliesIvaTax")}
            onChange={(value) => setBooleanField("appliesIvaTax", value)}
            readOnly={readOnly}
          />
          <CheckboxField
            checked={values.appliesIvaRetention}
            label={t("crm.quote.field.appliesIvaRetention")}
            onChange={(value) => setBooleanField("appliesIvaRetention", value)}
            readOnly={readOnly}
          />
          <CheckboxField
            checked={values.appliesIsrRetention}
            label={t("crm.quote.field.appliesIsrRetention")}
            onChange={(value) => setBooleanField("appliesIsrRetention", value)}
            readOnly={readOnly}
          />
        </div>
      </div>
    </form>
  );
}

function toValues(version: QuoteVersion): QuoteUpdateVersionValues {
  return {
    applyExchangeRateMargin: version.applyExchangeRateMargin,
    appliesIsrRetention: version.appliesIsrRetention,
    appliesIvaRetention: version.appliesIvaRetention,
    appliesIvaTax: version.appliesIvaTax,
    contractTemplateKey: version.contractTemplateKey,
    discountType: version.discountType,
    discountValueMxn: version.discountValueMxn,
    displayCurrency: version.displayCurrency,
    exchangeRateMarginPercent: version.exchangeRateMarginPercent,
    exchangeRateToMxn: version.exchangeRateToMxn,
    expiresAt: version.expiresAt,
    isrRetentionRatePercent: version.isrRetentionRatePercent,
    ivaRetentionRatePercent: version.ivaRetentionRatePercent,
    paymentPlanId: version.paymentPlanId,
    questionnaireTemplateKey: version.questionnaireTemplateKey,
    taxRatePercent: version.taxRatePercent,
  };
}
