import { MessageSquareText, StickyNote } from "lucide-react";

import type { Locale } from "@/core/i18n";

import type { Translate } from "../components/lead-form-types";
import type { Lead } from "../types/lead";
import type { LeadDetailTab } from "./lead-detail-types";
import { LeadOverview } from "./lead-overview";
import { LeadMessages } from "./lead-messages";

type LeadTabContentProps = {
  activeTab: LeadDetailTab;
  lead: Lead;
  locale: Locale;
  t: Translate;
};

export function LeadTabContent({
  activeTab,
  lead,
  locale,
  t,
}: LeadTabContentProps) {
  if (activeTab === "overview") {
    return <LeadOverview lead={lead} locale={locale} t={t} />;
  }

  const isNotes = activeTab === "notes";
  const Icon = isNotes ? StickyNote : MessageSquareText;
  const title = t(
    isNotes ? "crm.lead.detail.tab.notes" : "crm.lead.detail.tab.messages",
  );
  const content = isNotes ? lead.notes || t("crm.lead.detail.empty.notes") : null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <Icon aria-hidden="true" className="text-cyan-200" size={20} />
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {isNotes ? <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{content}</p> : <LeadMessages leadId={lead.id} t={t} />}
    </section>
  );
}
