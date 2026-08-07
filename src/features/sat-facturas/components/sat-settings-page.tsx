"use client";

import { ArrowLeft, Building2, Landmark, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n";

import { useSatSettings } from "../hooks/use-sat-settings";
import { SatSettingsCard, SatSettingsField } from "./sat-settings-card";

const fallback = (value: string, emptyValue: string) => value || emptyValue;

export function SatSettingsPage() {
  const { t } = useTranslation();
  const state = useSatSettings();
  const emptyValue = t("common.notProvided");

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/sat-facturas">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("satFacturas.action.back")}
            </Link>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("satFacturas.settings.title")}
            </h1>
            <p className="mt-3 max-w-3xl text-lg font-semibold text-zinc-500">
              {t("satFacturas.settings.subtitle")}
            </p>
          </div>
        </header>

        {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("satFacturas.loading")}</p> : null}
        {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("satFacturas.loadError")}</p> : null}

        {state.settings ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-3">
              <SectionTitle
                actionHref="/sat-facturas/settings/fiscal-profiles/new"
                actionLabel={t("satFacturas.settings.action.addProfile")}
                icon={<Building2 size={22} />}
                title={t("satFacturas.settings.fiscalProfiles")}
              />
              {!state.settings.fiscalProfiles.length ? <EmptyState text={t("satFacturas.settings.emptyProfiles")} /> : null}
              {state.settings.fiscalProfiles.map((profile) => (
                <SatSettingsCard
                  inactiveLabel={t("satFacturas.settings.inactive")}
                  isActive={profile.isActive}
                  key={profile.id}
                  subtitle={fallback(profile.legalName, emptyValue)}
                  title={profile.label}
                >
                  <SatSettingsField label={t("satFacturas.field.rfc")} value={fallback(profile.rfc, emptyValue)} />
                  <SatSettingsField label={t("satFacturas.field.taxRegime")} value={fallback(profile.taxRegime, emptyValue)} />
                  <SatSettingsField label={t("satFacturas.settings.field.constancia")} value={profile.constanciaFileUrl ? t("satFacturas.settings.available") : emptyValue} />
                  <SatSettingsField label={t("satFacturas.settings.field.opinion")} value={profile.opinionFileUrl ? t("satFacturas.settings.available") : emptyValue} />
                  <EditLink href={`/sat-facturas/settings/fiscal-profiles/${profile.id}/edit`} label={t("satFacturas.settings.action.edit")} />
                </SatSettingsCard>
              ))}
            </section>

            <section className="space-y-3">
              <SectionTitle
                actionHref="/sat-facturas/settings/bank-accounts/new"
                actionLabel={t("satFacturas.settings.action.addBankAccount")}
                icon={<Landmark size={22} />}
                title={t("satFacturas.settings.bankAccounts")}
              />
              {!state.settings.bankAccounts.length ? <EmptyState text={t("satFacturas.settings.emptyAccounts")} /> : null}
              {state.settings.bankAccounts.map((account) => (
                <SatSettingsCard
                  inactiveLabel={t("satFacturas.settings.inactive")}
                  isActive={account.isActive}
                  key={account.id}
                  subtitle={fallback(account.bankName, emptyValue)}
                  title={account.nickname}
                >
                  <SatSettingsField label={t("satFacturas.settings.field.beneficiary")} value={fallback(account.beneficiaryName, emptyValue)} />
                  <SatSettingsField label={t("satFacturas.settings.field.clabe")} value={fallback(account.clabe, emptyValue)} />
                  <SatSettingsField label={t("satFacturas.settings.field.currency")} value={account.currency.toUpperCase()} />
                  <SatSettingsField label={t("satFacturas.settings.field.profile")} value={fallback(account.fiscalProfileLabel, emptyValue)} />
                  <EditLink href={`/sat-facturas/settings/bank-accounts/${account.id}/edit`} label={t("satFacturas.settings.action.edit")} />
                </SatSettingsCard>
              ))}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function SectionTitle({
  actionHref,
  actionLabel,
  icon,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-cyan-300/15 text-cyan-200">{icon}</span>
        {title}
      </h2>
      <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-3 text-sm font-bold text-zinc-950" href={actionHref}>
        <Plus aria-hidden="true" size={16} />
        {actionLabel}
      </Link>
    </div>
  );
}

function EditLink({ href, label }: { href: string; label: string }) {
  return (
    <dd className="sm:col-span-2">
      <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 hover:border-cyan-300 hover:text-cyan-200" href={href}>
        <Pencil aria-hidden="true" size={16} />
        {label}
      </Link>
    </dd>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm font-semibold text-zinc-500">
      {text}
    </p>
  );
}
