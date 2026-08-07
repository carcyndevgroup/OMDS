"use client";

import { ArrowLeft, Building2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { PhoneInput } from "@/features/crm/shared/components/phone-input";

import { useCompanyProfile } from "../hooks/use-company-profile";
import { useCompanyProfileMutation } from "../hooks/use-company-profile-mutation";
import {
  initialCompanyProfile,
  validateCompanyProfile,
  type CompanyProfileErrors,
} from "../schemas/company-profile-schema";
import type { CompanyProfile } from "../types/company-profile";

export function CompanyProfilePage() {
  const { t } = useTranslation();
  const profileState = useCompanyProfile();
  const mutation = useCompanyProfileMutation();
  const [errors, setErrors] = useState<CompanyProfileErrors>({});
  const [values, setValues] = useState(initialCompanyProfile);

  useEffect(() => {
    if (profileState.profile) setValues(profileState.profile);
  }, [profileState.profile]);

  const setField = (field: keyof CompanyProfile, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    const validation = validateCompanyProfile(values);
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
          {t("settings.companyProfile.action.back")}
        </Link>
        <header>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
              <Building2 aria-hidden="true" size={24} />
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.companyProfile.title")}</h1>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.companyProfile.subtitle")}</p>
        </header>

        <section className="rounded-md border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-xl font-bold">{t("settings.companyProfile.card.title")}</h2>
          </div>
          <div className="space-y-5 p-5">
            {profileState.isLoading ? <p className="text-sm text-zinc-500">{t("settings.companyProfile.loading")}</p> : null}
            {profileState.hasError ? <p className="text-sm text-rose-300">{t("settings.companyProfile.loadError")}</p> : null}
            <p className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              {t("settings.companyProfile.note")}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <CrmTextInput error={errors.legalName} label={t("settings.companyProfile.field.legalName")} onChange={(value) => setField("legalName", value)} t={t} value={values.legalName} />
              <CrmTextInput label={t("settings.companyProfile.field.dbaName")} onChange={(value) => setField("dbaName", value)} t={t} value={values.dbaName} />
              <CrmTextInput label={t("settings.companyProfile.field.address")} onChange={(value) => setField("address", value)} t={t} value={values.address} />
              <PhoneInput label={t("settings.companyProfile.field.phone")} onChange={(value) => setField("phone", value)} t={t} value={values.phone} />
              <CrmTextInput label={t("settings.companyProfile.field.email")} onChange={(value) => setField("email", value)} t={t} value={values.email} />
              <CrmTextInput label={t("settings.companyProfile.field.website")} onChange={(value) => setField("website", value)} t={t} value={values.website} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
              {mutation.status === "success" ? <p className="text-sm font-bold text-cyan-200">{t("settings.companyProfile.message.success")}</p> : <span />}
              {mutation.status === "error" ? <p className="text-sm font-bold text-rose-300">{t("settings.companyProfile.message.error")}</p> : null}
              <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={save} type="button">
                <Save aria-hidden="true" size={17} />
                {t("settings.companyProfile.action.save")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
