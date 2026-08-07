import { AlertTriangle, Clock } from "lucide-react";

import type { EventDetailSectionProps } from "./event-detail-types";
import { buildEventTimeline } from "./event-timeline-utils";

const formatTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export function EventTimelineTab({
  event,
  locale,
  t,
}: EventDetailSectionProps) {
  const items = buildEventTimeline(event);

  if (!event.serviceStartTime) {
    return (
      <section className="rounded-md border border-dashed border-zinc-800 bg-zinc-900/60 p-8">
        <h2 className="text-2xl font-bold text-zinc-100">
          {t("crm.event.detail.placeholder.timelineTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
          {t("crm.event.timeline.empty.startTime")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t("crm.event.detail.placeholder.timelineTitle")}
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            {t("crm.event.timeline.subtitle")}
          </p>
        </div>
        {event.travelTimeMinutes === null ? (
          <p className="inline-flex items-center gap-2 rounded bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200">
            <AlertTriangle aria-hidden="true" size={15} />
            {t("crm.event.timeline.missingTravel")}
          </p>
        ) : null}
      </div>

      <ol className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 sm:grid-cols-[9rem_1fr]"
            key={item.titleKey}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-200">
              <Clock aria-hidden="true" size={16} />
              <span>
                {formatTime(item.startsAt, locale)}
                {item.endsAt ? ` - ${formatTime(item.endsAt, locale)}` : ""}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white">{t(item.titleKey)}</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-zinc-500">
                {t(item.descriptionKey)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
