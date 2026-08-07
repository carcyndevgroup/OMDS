"use client";

import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useEvent } from "../hooks/use-event";
import { EventDetailHeader } from "./event-detail-header";
import {
  EventDetailTabs,
  type EventDetailTab,
} from "./event-detail-tabs";
import { EventEquipmentTab } from "./event-equipment-tab";
import { EventFilesTab } from "./event-files-tab";
import { EventFinancialsTab } from "./event-financials-tab";
import { EventLinksTab } from "./event-links-tab";
import { EventNotesTab } from "./event-notes-tab";
import { EventOverview } from "./event-overview";
import { EventRunSheetTab } from "./event-run-sheet-tab";
import { EventStaffingTab } from "./event-staffing-tab";
import { EventTabPlaceholder } from "./event-tab-placeholder";
import { EventTimelineTab } from "./event-timeline-tab";

type EventDetailsProps = { id: string };

const placeholderMap = {
  financials: {
    bodyKey: "crm.event.detail.placeholder.financialsBody",
    titleKey: "crm.event.detail.placeholder.financialsTitle",
  },
  files: {
    bodyKey: "crm.event.detail.placeholder.filesBody",
    titleKey: "crm.event.detail.placeholder.filesTitle",
  },
  equipment: {
    bodyKey: "crm.event.detail.placeholder.equipmentBody",
    titleKey: "crm.event.detail.placeholder.equipmentTitle",
  },
  runSheet: {
    bodyKey: "crm.event.detail.placeholder.runSheetBody",
    titleKey: "crm.event.detail.placeholder.runSheetTitle",
  },
  staffing: {
    bodyKey: "crm.event.detail.placeholder.staffingBody",
    titleKey: "crm.event.detail.placeholder.staffingTitle",
  },
  tasks: {
    bodyKey: "crm.event.detail.placeholder.tasksBody",
    titleKey: "crm.event.detail.placeholder.tasksTitle",
  },
  timeline: {
    bodyKey: "crm.event.detail.placeholder.timelineBody",
    titleKey: "crm.event.detail.placeholder.timelineTitle",
  },
} as const;

export function EventDetails({ id }: EventDetailsProps) {
  const { locale, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<EventDetailTab>("overview");
  const state = useEvent(id);

  if (state.isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">
        {t("crm.event.list.loading")}
      </main>
    );
  }

  if (state.hasError || !state.event) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">
        {t("crm.event.list.loadError")}
      </main>
    );
  }

  const props = { event: state.event, locale, t };
  const content =
    activeTab === "overview" ? (
      <EventOverview {...props} />
    ) : activeTab === "timeline" ? (
      <EventTimelineTab {...props} />
    ) : activeTab === "runSheet" ? (
      <EventRunSheetTab {...props} />
    ) : activeTab === "staffing" ? (
      <EventStaffingTab {...props} />
    ) : activeTab === "equipment" ? (
      <EventEquipmentTab {...props} />
    ) : activeTab === "links" ? (
      <EventLinksTab {...props} />
    ) : activeTab === "files" ? (
      <EventFilesTab {...props} />
    ) : activeTab === "financials" ? (
      <EventFinancialsTab {...props} />
    ) : activeTab === "notes" ? (
      <EventNotesTab {...props} />
    ) : (
      <EventTabPlaceholder
        bodyKey={placeholderMap[activeTab].bodyKey}
        t={t}
        titleKey={placeholderMap[activeTab].titleKey}
      />
    );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <EventDetailHeader {...props} />
        <EventDetailTabs activeTab={activeTab} onChange={setActiveTab} t={t} />
        {content}
      </div>
    </main>
  );
}
