import type { Translate } from "../../shared/types/form-types";

export type ClientDetailTab =
  | "overview"
  | "quotes"
  | "files"
  | "questionnaires"
  | "contracts"
  | "invoices"
  | "messages"
  | "tasks"
  | "notes"
  | "portal";

type ClientDetailTabsProps = {
  activeTab: ClientDetailTab;
  onChange: (tab: ClientDetailTab) => void;
  t: Translate;
};

const tabs: { id: ClientDetailTab; labelKey: Parameters<Translate>[0] }[] = [
  { id: "overview", labelKey: "crm.client.detail.tab.overview" },
  { id: "quotes", labelKey: "crm.client.detail.tab.quotes" },
  { id: "questionnaires", labelKey: "crm.client.detail.tab.questionnaires" },
  { id: "contracts", labelKey: "crm.client.detail.tab.contracts" },
  { id: "invoices", labelKey: "crm.client.detail.tab.invoices" },
  { id: "messages", labelKey: "crm.client.detail.tab.messages" },
  { id: "tasks", labelKey: "crm.client.detail.tab.tasks" },
  { id: "notes", labelKey: "crm.client.detail.tab.notes" },
  { id: "files", labelKey: "crm.event.detail.tab.files" },
  { id: "portal", labelKey: "crm.client.detail.tab.portal" },
];

export function ClientDetailTabs({
  activeTab,
  onChange,
  t,
}: ClientDetailTabsProps) {
  return (
    <nav className="flex gap-8 overflow-x-auto border-b border-zinc-800">
      {tabs.map((tab) => (
        <button
          className={[
            "shrink-0 border-b-2 px-1 py-4 text-sm font-bold transition",
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
