"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { initialFiscalProfileValues } from "../schemas/sat-settings-schema";
import type { SatFiscalProfileFormValues } from "../types/sat-settings";
import { SatFiscalProfileForm } from "./sat-fiscal-profile-form";
import { SatFormShell } from "./sat-form-shell";

export function SatFiscalProfileCreate() {
  const router = useRouter();
  const { t } = useTranslation();

  const save = async (values: SatFiscalProfileFormValues) => {
    const response = await fetch("/api/sat-facturas/fiscal-profiles", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw new Error("profile_create_failed");
  };

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.backToSettings")}
      title={t("satFacturas.settings.newProfile")}
    >
      <SatFiscalProfileForm
        errorKey="satFacturas.settings.saveError"
        initialValues={initialFiscalProfileValues}
        onSubmit={save}
        onSuccess={() => router.push("/sat-facturas/settings")}
        submitKey="satFacturas.settings.action.createProfile"
        successKey="satFacturas.settings.profileSaved"
      />
    </SatFormShell>
  );
}
