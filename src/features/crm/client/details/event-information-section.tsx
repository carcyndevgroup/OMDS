import { CalendarDays, UsersRound } from "lucide-react";

import { eventTypeOptions } from "../../lead/constants/lead-options";
import { bookingStatusOptions, bookingTypeOptions } from "../constants/client-options";
import { ClientDetailField } from "./client-detail-field";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";
import { formatClientDate } from "./client-detail-types";

export function EventInformationSection(props: ClientDetailSectionProps) {
  const { client, locale, t } = props;
  const event = client.event;

  if (!event) {
    return (
      <ClientDetailSection title={t("crm.client.detail.section.event")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  const eventTypeKey = eventTypeOptions.find(
    (option) => option.value === event.eventType,
  )?.translationKey;
  const bookingTypeKey = bookingTypeOptions.find(
    (option) => option.value === event.bookingType,
  )?.translationKey;
  const statusKey = bookingStatusOptions.find(
    (option) => option.value === event.bookingStatus,
  )?.translationKey;

  return (
    <ClientDetailSection title={t("crm.client.detail.section.event")}>
      <dl className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        <ClientDetailField label={t("public.questionnaire.field.eventName")}>
          {event.eventName || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.lead.field.eventType")}>
          {eventTypeKey ? t(eventTypeKey) : t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.lead.field.eventDate")}>
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" size={16} />
            {formatClientDate(event.eventDate, locale)}
          </span>
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.serviceStartTime")}>
          {event.serviceStartTime ?? t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.serviceEndTime")}>
          {event.serviceEndTime ?? t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.lead.field.guestCount")}>
          <span className="inline-flex items-center gap-2">
            <UsersRound aria-hidden="true" size={16} />
            {event.guestCount}
          </span>
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.marqueeNames")}>
          {event.marqueeSignNames || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.eventHashtags")}>
          {event.eventHashtags || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.detail.field.bookingType")}>
          {bookingTypeKey ? t(bookingTypeKey) : t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.bookingStatus")}>
          {statusKey ? t(statusKey) : t("common.notProvided")}
        </ClientDetailField>
      </dl>
    </ClientDetailSection>
  );
}
