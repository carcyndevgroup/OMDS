"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { useSatFacturas } from "../hooks/use-sat-facturas";
import { useSatSettings } from "../hooks/use-sat-settings";
import type { SatPaymentFormValues } from "../types/sat-factura";
import { SatFormShell } from "./sat-form-shell";
import { SatPaymentForm } from "./sat-payment-form";

export function SatPaymentCreate() {
  const router = useRouter();
  const { t } = useTranslation();
  const facturas = useSatFacturas();
  const settings = useSatSettings();
  const isLoading = facturas.isLoading || settings.isLoading;
  const hasError = facturas.hasError || settings.hasError;

  const submit = async (values: SatPaymentFormValues) => {
    const response = await fetch("/api/sat-facturas/payments", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) throw new Error("sat_payment_failed");
    router.push("/sat-facturas");
  };

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.back")}
      title={t("satFacturas.payment.title")}
    >
      {isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("satFacturas.loading")}</p> : null}
      {hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("satFacturas.loadError")}</p> : null}
      {!isLoading && !hasError && settings.settings ? (
        <SatPaymentForm
          bankAccounts={settings.settings.bankAccounts}
          facturas={facturas.facturas}
          onSubmit={submit}
        />
      ) : null}
    </SatFormShell>
  );
}
