"use client";

import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useLead } from "../hooks/use-lead";
import { ArchiveAuditPanel } from "../../shared/components/archive-audit-panel";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadDetailTabs } from "./lead-detail-tabs";
import type { LeadDetailTab } from "./lead-detail-types";
import { LeadTabContent } from "./lead-tab-content";

type LeadDetailsProps = {
  id: string;
};

export function LeadDetails({ id }: LeadDetailsProps) {
  const { locale, t } = useTranslation();
  const { hasError, isLoading, lead } = useLead(id);
  const [activeTab, setActiveTab] = useState<LeadDetailTab>("overview");

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">
        {t("crm.lead.detail.loading")}
      </main>
    );
  }

  if (hasError || !lead) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">
        {t("crm.lead.detail.loadError")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <LeadDetailHeader lead={lead} t={t} />
        <ArchiveAuditPanel entity="leads" id={id} t={t} />
        <LeadDetailTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          t={t}
        />
        <LeadTabContent
          activeTab={activeTab}
          lead={lead}
          locale={locale}
          t={t}
        />
      </div>
    </main>
  );
}
