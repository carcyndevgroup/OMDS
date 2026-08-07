"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteUpdateVersionValues, QuoteVersion } from "../types/quote";
import { SelectField } from "./quote-settings-fields";

type PaymentPlanOption = {
  finalPaymentPercent: string;
  id: string;
  isDefault: boolean;
  name: string;
  retainerPercent: string;
};

type QuotePaymentPlanSectionProps = {
  onUpdate: (values: QuoteUpdateVersionValues) => Promise<void>;
  readOnly: boolean;
  t: Translate;
  version: QuoteVersion;
};

export function QuotePaymentPlanSection(props: QuotePaymentPlanSectionProps) {
  const { onUpdate, readOnly, t, version } = props;
  const [plans, setPlans] = useState<PaymentPlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [paymentPlanId, setPaymentPlanId] = useState(version.paymentPlanId ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const hasAutoSelectedDefault = useRef(false);

  useEffect(() => setPaymentPlanId(version.paymentPlanId ?? ""), [version.paymentPlanId]);

  useEffect(() => {
    if (readOnly || hasAutoSelectedDefault.current || version.paymentPlanId) return;

    const defaultPlan = plans.find((plan) => plan.isDefault);
    if (!defaultPlan) return;

    hasAutoSelectedDefault.current = true;
    void save(defaultPlan.id, "");
  }, [plans, readOnly, version.paymentPlanId]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);

    void fetch("/api/settings/payment-plans", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("payment_plan_list_failed");
        return response.json() as Promise<{ data: PaymentPlanOption[] }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setPlans(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const save = async (nextPaymentPlanId: string, previousPaymentPlanId = paymentPlanId) => {
    setPaymentPlanId(nextPaymentPlanId);
    setSaveStatus("saving");
    try {
      await onUpdate({
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
        paymentPlanId: nextPaymentPlanId || null,
        questionnaireTemplateKey: version.questionnaireTemplateKey,
        taxRatePercent: version.taxRatePercent,
      });
      setSaveStatus("saved");
    } catch {
      setPaymentPlanId(previousPaymentPlanId);
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-500">{t("crm.quote.settings.payment.loading")}</p>;
  }

  if (hasError) {
    return <p className="text-sm text-rose-300">{t("crm.quote.settings.payment.loadError")}</p>;
  }

  if (!plans.length) {
    return <p className="text-sm text-zinc-500">{t("crm.quote.settings.payment.empty")}</p>;
  }

  return (
    <div className="space-y-3">
      <SelectField
        label={t("crm.quote.settings.payment.select")}
        onChange={save}
        readOnly={readOnly}
        value={paymentPlanId}
      >
        <option value="">{t("crm.quote.settings.payment.none")}</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} ({plan.retainerPercent}% / {plan.finalPaymentPercent}%)
            {plan.isDefault ? ` \u2013 ${t("settings.paymentPlan.status.default")}` : ""}
          </option>
        ))}
      </SelectField>
      <Link
        className="inline-flex text-xs font-bold text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-100"
        href="/settings/payment-plans"
      >
        {t("crm.quote.settings.payment.managePlans")}
      </Link>
      {saveStatus === "saved" ? (
        <p className="text-xs font-bold text-cyan-200">{t("crm.quote.settings.payment.saved")}</p>
      ) : null}
      {saveStatus === "error" ? (
        <p className="text-xs font-bold text-rose-300">{t("crm.quote.settings.payment.saveError")}</p>
      ) : null}
    </div>
  );
}
