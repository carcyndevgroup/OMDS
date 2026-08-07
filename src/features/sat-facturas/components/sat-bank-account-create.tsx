"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { initialBankAccountValues } from "../schemas/sat-settings-schema";
import type { SatBankAccountFormValues } from "../types/sat-settings";
import { SatBankAccountForm } from "./sat-bank-account-form";
import { SatFormShell } from "./sat-form-shell";

export function SatBankAccountCreate() {
  const router = useRouter();
  const { t } = useTranslation();

  const save = async (values: SatBankAccountFormValues) => {
    const response = await fetch("/api/sat-facturas/bank-accounts", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw new Error("bank_account_create_failed");
  };

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.backToSettings")}
      title={t("satFacturas.settings.newBankAccount")}
    >
      <SatBankAccountForm
        errorKey="satFacturas.settings.saveError"
        initialValues={initialBankAccountValues}
        onSubmit={save}
        onSuccess={() => router.push("/sat-facturas/settings")}
        submitKey="satFacturas.settings.action.createBankAccount"
        successKey="satFacturas.settings.bankAccountSaved"
      />
    </SatFormShell>
  );
}
