"use client";

import { ArrowLeft, Save, Signature } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import { useSigningProfile } from "../hooks/use-signing-profile";
import { useSigningProfileMutation } from "../hooks/use-signing-profile-mutation";
import {
  initialSigningProfile,
  validateSigningProfile,
  type SigningProfileErrors,
} from "../schemas/signing-profile-schema";
import type { SigningProfile } from "../types/signing-profile";

export function SigningProfilePage() {
  const { t } = useTranslation();
  const profileState = useSigningProfile();
  const mutation = useSigningProfileMutation();
  const [errors, setErrors] = useState<SigningProfileErrors>({});
  const [values, setValues] = useState(initialSigningProfile);

  useEffect(() => {
    if (profileState.profile) setValues(profileState.profile);
  }, [profileState.profile]);

  const setField = (field: keyof SigningProfile, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    const validation = validateSigningProfile(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await mutation.save(values);
    await profileState.refresh();
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
          <ArrowLeft aria-hidden="true" size={18} />
          {t("settings.signingProfile.action.back")}
        </Link>
        <header>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
              <Signature aria-hidden="true" size={24} />
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.signingProfile.title")}</h1>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.signingProfile.subtitle")}</p>
        </header>

        <section className="rounded-md border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-xl font-bold">{t("settings.signingProfile.card.title")}</h2>
          </div>
          <div className="space-y-5 p-5">
            {profileState.isLoading ? <p className="text-sm text-zinc-500">{t("settings.signingProfile.loading")}</p> : null}
            {profileState.hasError ? <p className="text-sm text-rose-300">{t("settings.signingProfile.loadError")}</p> : null}
            <p className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              {t("settings.signingProfile.note")}
            </p>
            <CrmTextInput error={errors.authorizedSignerFullName} label={t("settings.signingProfile.field.authorizedSignerFullName")} onChange={(value) => setField("authorizedSignerFullName", value)} t={t} value={values.authorizedSignerFullName} />
            <CrmTextInput error={errors.authorizedSignerTitle} label={t("settings.signingProfile.field.authorizedSignerTitle")} onChange={(value) => setField("authorizedSignerTitle", value)} t={t} value={values.authorizedSignerTitle} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
              {mutation.status === "success" ? <p className="text-sm font-bold text-cyan-200">{t("settings.signingProfile.message.success")}</p> : <span />}
              {mutation.status === "error" ? <p className="text-sm font-bold text-rose-300">{t("settings.signingProfile.message.error")}</p> : null}
              <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={save} type="button">
                <Save aria-hidden="true" size={17} />
                {t("settings.signingProfile.action.save")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
