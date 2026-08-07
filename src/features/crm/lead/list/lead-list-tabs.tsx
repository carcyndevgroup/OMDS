import type { Translate } from "../components/lead-form-types";
import type { LeadListTab } from "./lead-list-types";

type LeadListTabsProps = {
  activeTab: LeadListTab;
  counts: Record<LeadListTab, number>;
  onChange: (tab: LeadListTab) => void;
  t: Translate;
};

const tabs: { id: LeadListTab; labelKey: Parameters<Translate>[0] }[] = [
  { id: "active", labelKey: "crm.lead.list.tab.active" },
  { id: "converted", labelKey: "crm.lead.list.tab.converted" },
  { id: "archived", labelKey: "crm.lead.list.tab.archived" },
];

export function LeadListTabs({
  activeTab,
  counts,
  onChange,
  t,
}: LeadListTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-zinc-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            className={[
              "flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-sm font-bold transition",
              isActive
                ? "border-cyan-300 text-cyan-200"
                : "border-transparent text-zinc-500 hover:text-zinc-200",
            ].join(" ")}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {t(tab.labelKey)}
            <span
              className={[
                "flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs",
                isActive ? "bg-cyan-300 text-zinc-950" : "bg-zinc-800 text-zinc-300",
              ].join(" ")}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
