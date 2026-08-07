"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { useSatFiscalProfile } from "../hooks/use-sat-fiscal-profile";
import { toFiscalProfileValues } from "../schemas/sat-settings-schema";
import type { SatFiscalProfileFormValues } from "../types/sat-settings";
import { SatFiscalProfileForm } from "./sat-fiscal-profile-form";
import { SatFormShell } from "./sat-form-shell";

type SatFiscalProfileEditProps = { profileId: string };

export function SatFiscalProfileEdit({ profileId }: SatFiscalProfileEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const state = useSatFiscalProfile(profileId);

  const save = async (values: SatFiscalProfileFormValues) => {
    const response = await fetch(`/api/sat-facturas/fiscal-profiles/${profileId}`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) throw new Error("profile_update_failed");
  };

  return (
    <SatFormShell
      subtitle={t("satFacturas.action.backToSettings")}
      title={t("satFacturas.settings.editProfile")}
    >
      {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("common.loading")}</p> : null}
      {state.hasError || (!state.isLoading && !state.profile) ? <p className="py-12 text-center text-sm text-rose-300">{t("common.error")}</p> : null}
      {state.profile ? (
        <SatFiscalProfileForm
          errorKey="satFacturas.settings.saveError"
          initialValues={toFiscalProfileValues(state.profile)}
          onSubmit={save}
          onSuccess={() => router.push("/sat-facturas/settings")}
          submitKey="satFacturas.settings.action.saveProfile"
          successKey="satFacturas.settings.profileSaved"
        />
      ) : null}
    </SatFormShell>
  );
}
