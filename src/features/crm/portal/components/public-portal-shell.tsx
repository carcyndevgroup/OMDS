"use client";

import { useTranslation, type Locale } from "@/core/i18n";

import type {
  PublicClientPortalAccess,
  PublicPortalContract,
  PublicPortalInvoice,
  PublicPortalQuestionnaire,
  PublicPortalQuote,
} from "../types/client-portal";
import { PublicPortalSummary } from "./public-portal-summary";
import { PublicPortalTabs } from "./public-portal-tabs";

type PublicPortalShellProps = {
  accessKey: string;
  contracts: PublicPortalContract[];
  initialTab?: string;
  invoices: PublicPortalInvoice[];
  portal: PublicClientPortalAccess;
  questionnaires: PublicPortalQuestionnaire[];
  quotes: PublicPortalQuote[];
};

const locales: Locale[] = ["en", "es"];

export function PublicPortalShell(props: PublicPortalShellProps) {
  const { accessKey, contracts, initialTab, invoices, portal, questionnaires, quotes } = props;
  const { locale, setLocale, t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10 text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="text-sm font-bold uppercase text-cyan-300">
              {t("brand.shortName")}
            </p>
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 p-1">
              {locales.map((option) => (
                <button
                  className={[
                    "rounded px-3 py-1.5 text-xs font-bold uppercase transition",
                    locale === option
                      ? "bg-cyan-300 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-100",
                  ].join(" ")}
                  key={option}
                  onClick={() => setLocale(option)}
                  type="button"
                >
                  {option === "en" ? t("common.english") : t("common.spanish")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-normal text-white">
              {t("public.portal.heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
              {t("public.portal.subtitle")}
            </p>
          </div>
        </header>

        <PublicPortalSummary portal={portal} />
        <PublicPortalTabs
          accessKey={accessKey}
          contracts={contracts}
          initialTab={initialTab}
          invoices={invoices}
          portal={portal}
          questionnaires={questionnaires}
          quotes={quotes}
        />
      </div>
    </main>
  );
}