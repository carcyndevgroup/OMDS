"use client";

import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";

import { VenuePageHeader } from "../components/venue-page-header";
import { useVenue } from "../hooks/use-venue";
import {
  VenueDetailTabs,
  type VenueDetailTab,
} from "./venue-detail-tabs";
import { VenueContactsTab } from "./venue-contacts-tab";
import { VenueEventsTab } from "./venue-events-tab";
import { VenueOverview } from "./venue-overview";
import { VenueSettingsTab } from "./venue-settings-tab";
import { VenueSubLocationsTab } from "./venue-sub-locations-tab";
import { VenueTabPlaceholder } from "./venue-tab-placeholder";

type VenueDetailsProps = { id: string };

const placeholderMap = {
  notes: {
    bodyKey: "crm.venue.detail.placeholder.notesBody",
    titleKey: "crm.venue.detail.placeholder.notesTitle",
  },
} as const;

export function VenueDetails({ id }: VenueDetailsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<VenueDetailTab>("overview");
  const state = useVenue(id);
  const usesSubLocations = state.venue?.usesSubLocations ?? false;

  useEffect(() => {
    if (!usesSubLocations && activeTab === "locations") {
      setActiveTab("overview");
    }
  }, [activeTab, usesSubLocations]);

  if (state.isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">
        {t("crm.venue.list.loading")}
      </main>
    );
  }

  if (state.hasError || !state.venue) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">
        {t("crm.venue.list.loadError")}
      </main>
    );
  }

  const content =
    activeTab === "overview" ? (
      <VenueOverview t={t} venue={state.venue} />
    ) : activeTab === "contacts" ? (
      <VenueContactsTab venueId={state.venue.id} />
    ) : activeTab === "locations" && state.venue.usesSubLocations ? (
      <VenueSubLocationsTab venueId={state.venue.id} />
    ) : activeTab === "events" ? (
      <VenueEventsTab venueId={state.venue.id} />
    ) : activeTab === "settings" ? (
      <VenueSettingsTab venue={state.venue} />
    ) : activeTab === "notes" ? (
      <VenueTabPlaceholder
        bodyKey={placeholderMap[activeTab].bodyKey}
        t={t}
        titleKey={placeholderMap[activeTab].titleKey}
      />
    ) : (
      <VenueOverview t={t} venue={state.venue} />
    );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <VenuePageHeader
          backLabel={t("crm.venue.action.back")}
          editHref={`/crm/venues/${id}/edit`}
          editLabel={t("crm.venue.action.edit")}
          title={state.venue.name}
        />
        <VenueDetailTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          showLocations={state.venue.usesSubLocations}
          t={t}
        />
        {content}
      </div>
    </main>
  );
}
