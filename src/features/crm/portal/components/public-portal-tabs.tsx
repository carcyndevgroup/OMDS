"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import type {
  ClientPortalStep,
  PublicClientPortalAccess,
  PublicPortalContract,
  PublicPortalInvoice,
  PublicPortalQuestionnaire,
  PublicPortalQuote,
} from "../types/client-portal";
import { PublicContractSection } from "./public-contract-section";
import { PublicInvoiceSection } from "./public-invoice-section";
import { PublicQuestionnaireSection } from "./public-questionnaire-section";
import { PublicQuoteSection } from "./public-quote-section";

type PublicPortalTabsProps = {
  accessKey: string;
  contracts: PublicPortalContract[];
  initialTab?: string;
  invoices: PublicPortalInvoice[];
  portal: PublicClientPortalAccess;
  questionnaires: PublicPortalQuestionnaire[];
  quotes: PublicPortalQuote[];
};

type PortalTab = {
  id: ClientPortalStep;
  labelKey: TranslationKey;
  requirementKey: TranslationKey;
  read: (portal: PublicClientPortalAccess) => boolean;
};

const tabs: PortalTab[] = [
  { id: "quotes", labelKey: "crm.portal.step.quotes", requirementKey: "public.portal.locked.quotes", read: (portal) => portal.quotesVisible },
  { id: "questionnaires", labelKey: "crm.portal.step.questionnaires", requirementKey: "public.portal.locked.questionnaires", read: (portal) => portal.questionnairesVisible },
  { id: "contracts", labelKey: "crm.portal.step.contracts", requirementKey: "public.portal.locked.contracts", read: (portal) => portal.contractsVisible },
  { id: "invoices", labelKey: "crm.portal.step.invoices", requirementKey: "public.portal.locked.invoices", read: (portal) => portal.invoicesVisible },
  { id: "reviews", labelKey: "crm.portal.step.reviews", requirementKey: "public.portal.locked.reviews", read: (portal) => portal.reviewsVisible },
];

export function PublicPortalTabs(props: PublicPortalTabsProps) {
  const { accessKey, contracts, initialTab, invoices, portal, questionnaires, quotes } = props;
  const { t } = useTranslation();
  const firstOpen = tabs.find((tab) => tab.read(portal))?.id ?? "quotes";
  const requestedTab = tabs.find((tab) => tab.id === initialTab)?.id;
  const initialActiveTab = requestedTab && tabs.some((tab) => tab.id === requestedTab && tab.read(portal))
    ? requestedTab
    : firstOpen;
  const [activeTab, setActiveTab] = useState<ClientPortalStep>(initialActiveTab);
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const isOpen = active.read(portal);

  return (
    <section className="space-y-6">
      <nav className="flex gap-6 overflow-x-auto border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            className={[
              "flex shrink-0 items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition",
              activeTab === tab.id
                ? "border-cyan-300 text-cyan-200"
                : "border-transparent text-zinc-500 hover:text-white",
            ].join(" ")}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {t(tab.labelKey)}
            {tab.read(portal) ? null : <LockKeyhole aria-hidden="true" size={15} />}
          </button>
        ))}
      </nav>

      {isOpen ? (
        <PortalTabContent
          accessKey={accessKey}
          contracts={contracts}
          activeTab={activeTab}
          invoices={invoices}
          questionnaires={questionnaires}
          quotes={quotes}
        />
      ) : (
        <LockedMessage message={t(active.requirementKey)} />
      )}
    </section>
  );
}

function PortalTabContent(props: {
  accessKey: string;
  contracts: PublicPortalContract[];
  activeTab: ClientPortalStep;
  invoices: PublicPortalInvoice[];
  questionnaires: PublicPortalQuestionnaire[];
  quotes: PublicPortalQuote[];
}) {
  const { accessKey, activeTab, contracts, invoices, questionnaires, quotes } = props;
  const { t } = useTranslation();

  if (activeTab === "quotes") {
    return <PublicQuoteSection accessKey={accessKey} quotes={quotes} />;
  }

  if (activeTab === "questionnaires") {
    return (
      <PublicQuestionnaireSection
        accessKey={accessKey}
        questionnaires={questionnaires}
      />
    );
  }

  if (activeTab === "contracts") {
    return <PublicContractSection accessKey={accessKey} contracts={contracts} />;
  }

  if (activeTab === "invoices") {
    return <PublicInvoiceSection accessKey={accessKey} invoices={invoices} />;
  }

  return (
    <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
      {t("public.portal.documents.empty")}
    </p>
  );
}

function LockedMessage(props: { message: string }) {
  const { message } = props;

  return (
    <div className="rounded-md border border-amber-300/20 bg-amber-300/10 p-5">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-0.5 text-amber-200" size={18} />
        <p className="text-sm leading-6 text-amber-100">{message}</p>
      </div>
    </div>
  );
}
