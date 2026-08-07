import type { TranslationKey } from "@/core/i18n";

import type { EventDetail } from "../types/event";

export type EventTimelineItem = {
  descriptionKey: TranslationKey;
  endsAt?: Date;
  startsAt: Date;
  titleKey: TranslationKey;
};

const toDate = (eventDate: string, serviceStartTime: string) => {
  const [hours, minutes] = serviceStartTime.split(":").map(Number);
  const date = new Date(`${eventDate}T00:00:00`);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60_000);
};

export function buildEventTimeline(event: EventDetail): EventTimelineItem[] {
  if (!event.serviceStartTime) return [];

  const travel = event.travelTimeMinutes ?? 0;
  const serviceStart = toDate(event.eventDate, event.serviceStartTime);
  const setupStart = addMinutes(serviceStart, -event.setupDurationMinutes);
  const venueArrival = addMinutes(setupStart, -event.arrivalBufferMinutes);
  const leaveHq = addMinutes(
    venueArrival,
    -(travel + event.departureBufferMinutes),
  );
  const meetAndLoad = addMinutes(leaveHq, -event.loadBeforeDepartureMinutes);
  const serviceEnd = addMinutes(serviceStart, event.serviceDurationMinutes);
  const packEnd = addMinutes(serviceEnd, event.packUpMinutes);
  const returnHq = addMinutes(packEnd, travel + event.unloadAfterReturnMinutes);

  return [
    {
      descriptionKey: "crm.event.timeline.meetLoad.description",
      endsAt: leaveHq,
      startsAt: meetAndLoad,
      titleKey: "crm.event.timeline.meetLoad.title",
    },
    {
      descriptionKey: "crm.event.timeline.leave.description",
      startsAt: leaveHq,
      titleKey: "crm.event.timeline.leave.title",
    },
    {
      descriptionKey: "crm.event.timeline.arrive.description",
      startsAt: venueArrival,
      titleKey: "crm.event.timeline.arrive.title",
    },
    {
      descriptionKey: "crm.event.timeline.setup.description",
      endsAt: serviceStart,
      startsAt: setupStart,
      titleKey: "crm.event.timeline.setup.title",
    },
    {
      descriptionKey: "crm.event.timeline.start.description",
      startsAt: serviceStart,
      titleKey: "crm.event.timeline.start.title",
    },
    {
      descriptionKey: "crm.event.timeline.end.description",
      startsAt: serviceEnd,
      titleKey: "crm.event.timeline.end.title",
    },
    {
      descriptionKey: "crm.event.timeline.pack.description",
      endsAt: packEnd,
      startsAt: serviceEnd,
      titleKey: "crm.event.timeline.pack.title",
    },
    {
      descriptionKey: "crm.event.timeline.return.description",
      startsAt: returnHq,
      titleKey: "crm.event.timeline.return.title",
    },
  ];
}
