"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ClientDetailTabs, type ClientDetailTab } from "./client-detail-tabs";
import { ClientContractsTab } from "./client-contracts-tab";
import { ClientInformationSection } from "./client-information-section";
import { ClientInvoicesTab } from "./client-invoices-tab";
import { ClientMessagesTab } from "./client-messages-tab";
import { ClientNotesSection } from "./client-notes-section";
import { ClientPortalTab } from "./client-portal-tab";
import { ClientFilesTab } from "./client-files-tab";
import { ClientQuestionnairesTab } from "./client-questionnaires-tab";
import { ClientQuotesTab } from "./client-quotes-tab";
import { ClientServicesSection } from "./client-services-section";
import { ClientTabPlaceholder } from "./client-tab-placeholder";
import { EventContactsSection } from "./event-contacts-section";
import { EventInformationSection } from "./event-information-section";
import { EventPlannersSection } from "./event-planners-section";
import { useClientWorkspace } from "./client-workspace";
import { VenueInformationSection } from "./venue-information-section";
import { ArchiveAuditPanel } from "../../shared/components/archive-audit-panel";
import { CrmActivityLog } from "../../shared/components/crm-activity-log";

const placeholderMap = {
  tasks: {
    bodyKey: "crm.client.detail.placeholder.tasksBody",
    titleKey: "crm.client.detail.placeholder.tasksTitle",
  },
} as const;

const clientDetailTabIds: ClientDetailTab[] = [
  "overview",
  "quotes",
  "questionnaires",
  "contracts",
  "invoices",
  "messages",
  "tasks",
  "notes",
  "files",
  "portal",
];

export function ClientDetails() {
  const sectionProps = useClientWorkspace();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ClientDetailTab>(() => getClientDetailTab(tabParam));

  useEffect(() => {
    setActiveTab(getClientDetailTab(tabParam));
  }, [tabParam]);

  const handleTabChange = (tab: ClientDetailTab) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    setActiveTab(tab);

    if (tab === "overview") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const content =
    activeTab === "overview" ? (
      <div className="space-y-6">
        <ClientInformationSection {...sectionProps} />
        <EventInformationSection {...sectionProps} />
        <VenueInformationSection {...sectionProps} />
        <ClientServicesSection {...sectionProps} />
        <EventContactsSection {...sectionProps} />
        <EventPlannersSection {...sectionProps} />
        <CrmActivityLog entity="clients" id={sectionProps.id} t={sectionProps.t} />
      </div>
    ) : activeTab === "quotes" ? (
      <ClientQuotesTab {...sectionProps} />
    ) : activeTab === "files" ? (
      <ClientFilesTab {...sectionProps} />
    ) : activeTab === "questionnaires" ? (
      <ClientQuestionnairesTab {...sectionProps} />
    ) : activeTab === "contracts" ? (
      <ClientContractsTab {...sectionProps} />
    ) : activeTab === "invoices" ? (
      <ClientInvoicesTab {...sectionProps} />
    ) : activeTab === "messages" ? (
      <ClientMessagesTab {...sectionProps} />
    ) : activeTab === "notes" ? (
      <ClientNotesSection {...sectionProps} />
    ) : activeTab === "portal" ? (
      <ClientPortalTab {...sectionProps} />
    ) : (
      <ClientTabPlaceholder
        bodyKey={placeholderMap[activeTab].bodyKey}
        t={sectionProps.t}
        titleKey={placeholderMap[activeTab].titleKey}
      />
    );

  return (
    <div className="space-y-6">
      <ClientDetailTabs
        activeTab={activeTab}
        onChange={handleTabChange}
        t={sectionProps.t}
      />
      <ArchiveAuditPanel entity="clients" id={sectionProps.id} t={sectionProps.t} />
      {content}
    </div>
  );
}

function getClientDetailTab(value: string | null): ClientDetailTab {
  return clientDetailTabIds.includes(value as ClientDetailTab)
    ? (value as ClientDetailTab)
    : "overview";
}
