import type { Translate } from "../components/lead-form-types";
import type { LeadDetailTab } from "./lead-detail-types";

type LeadDetailTabsProps = {
  activeTab: LeadDetailTab;
  onChange: (tab: LeadDetailTab) => void;
  t: Translate;
};

const tabs: { id: LeadDetailTab; labelKey: Parameters<Translate>[0] }[] = [
  { id: "overview", labelKey: "crm.lead.detail.tab.overview" },
  { id: "messages", labelKey: "crm.lead.detail.tab.messages" },
  { id: "notes", labelKey: "crm.lead.detail.tab.notes" },
];

export function LeadDetailTabs({
  activeTab,
  onChange,
  t,
}: LeadDetailTabsProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-zinc-800">
      {tabs.map((tab) => (
        <button
          className={[
            "shrink-0 border-b-2 px-3 py-4 text-sm font-bold transition",
            activeTab === tab.id
              ? "border-cyan-300 text-cyan-200"
              : "border-transparent text-zinc-500 hover:text-white",
          ].join(" ")}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </nav>
  );
}
