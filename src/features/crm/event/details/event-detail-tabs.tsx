import type { Translate } from "../../shared/types/form-types";

export type EventDetailTab =
  | "overview"
  | "timeline"
  | "staffing"
  | "equipment"
  | "links"
  | "runSheet"
  | "financials"
  | "files"
  | "tasks"
  | "notes";

type EventDetailTabsProps = {
  activeTab: EventDetailTab;
  onChange: (tab: EventDetailTab) => void;
  t: Translate;
};

const tabs: { id: EventDetailTab; labelKey: Parameters<Translate>[0] }[] = [
  { id: "overview", labelKey: "crm.event.detail.tab.overview" },
  { id: "timeline", labelKey: "crm.event.detail.tab.timeline" },
  { id: "staffing", labelKey: "crm.event.detail.tab.staffing" },
  { id: "equipment", labelKey: "crm.event.detail.tab.equipment" },
  { id: "links", labelKey: "crm.event.detail.tab.links" },
  { id: "runSheet", labelKey: "crm.event.detail.tab.runSheet" },
  { id: "financials", labelKey: "crm.event.detail.tab.financials" },
  { id: "files", labelKey: "crm.event.detail.tab.files" },
  { id: "tasks", labelKey: "crm.event.detail.tab.tasks" },
  { id: "notes", labelKey: "crm.event.detail.tab.notes" },
];

export function EventDetailTabs({
  activeTab,
  onChange,
  t,
}: EventDetailTabsProps) {
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
