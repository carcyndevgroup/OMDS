import type { Translate } from "../../shared/types/form-types";

export type VenueDetailTab =
  | "overview"
  | "contacts"
  | "locations"
  | "events"
  | "notes"
  | "settings";

type VenueDetailTabsProps = {
  activeTab: VenueDetailTab;
  onChange: (tab: VenueDetailTab) => void;
  showLocations: boolean;
  t: Translate;
};

const tabs: { id: VenueDetailTab; labelKey: Parameters<Translate>[0] }[] = [
  { id: "overview", labelKey: "crm.venue.detail.tab.overview" },
  { id: "contacts", labelKey: "crm.venue.detail.tab.contacts" },
  { id: "locations", labelKey: "crm.venue.detail.tab.locations" },
  { id: "events", labelKey: "crm.venue.detail.tab.events" },
  { id: "notes", labelKey: "crm.venue.detail.tab.notes" },
  { id: "settings", labelKey: "crm.venue.detail.tab.settings" },
];

export function VenueDetailTabs({
  activeTab,
  onChange,
  showLocations,
  t,
}: VenueDetailTabsProps) {
  const visibleTabs = showLocations
    ? tabs
    : tabs.filter((tab) => tab.id !== "locations");

  return (
    <nav className="flex gap-8 overflow-x-auto border-b border-zinc-800">
      {visibleTabs.map((tab) => (
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
