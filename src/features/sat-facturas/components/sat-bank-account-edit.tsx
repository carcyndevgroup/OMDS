"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { useSatBankAccount } from "../hooks/use-sat-bank-account";
import { toBankAccountValues } from "../schemas/sat-settings-schema";
import type { SatBankAccountFormValues } from "../types/sat-settings";
import { SatBankAccountForm } from "./sat-bank-account-form";
import { SatFormShell } from "./sat-form-shell";

type SatBankAccountEditProps = { accountId: string };

export function SatBankAccountEdit({ accountId }: SatBankAccountEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const state = useSatBankAccount(accountId);

  const save = async (values: SatBankAccountFormValues) => {
    const response = await fetch(`/api/sat-facturas/bank-accounts/${accountId}`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) throw new Error("bank_account_update_failed");
  };

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.backToSettings")}
      title={t("satFacturas.settings.editBankAccount")}
    >
      {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("common.loading")}</p> : null}
      {state.hasError || (!state.isLoading && !state.account) ? <p className="py-12 text-center text-sm text-rose-300">{t("common.error")}</p> : null}
      {state.account ? (
        <SatBankAccountForm
          errorKey="satFacturas.settings.saveError"
          initialValues={toBankAccountValues(state.account)}
          onSubmit={save}
          onSuccess={() => router.push("/sat-facturas/settings")}
          submitKey="satFacturas.settings.action.saveBankAccount"
          successKey="satFacturas.settings.bankAccountSaved"
        />
      ) : null}
    </SatFormShell>
  );
}
