"use client";

import { Mail, Pencil, Phone, Save, Tag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { bookingStatusOptions, bookingTypeOptions } from "../../client/constants/client-options";
import type { BookingType } from "../../client/types/client";
import { eventTypeOptions } from "../../lead/constants/lead-options";
import { serviceOptions } from "../../shared/constants/service-options";
import { contactRoleOptions } from "../../shared/constants/crm-options";
import { formatPhone } from "../../shared/utils/phone-format";
import type { BookingStatus } from "../../shared/types/crm-options";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { useEventOverviewMutation } from "../hooks/use-event-overview-mutation";
import { findOptionKey, powerSupplyKey } from "./event-detail-option-keys";
import { EventDetailField } from "./event-detail-field";
import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";
import { formatEventDate } from "./event-detail-types";

export function EventOverview({ event, locale, t }: EventDetailSectionProps) {
  const eventTypeKey = findOptionKey(eventTypeOptions, event.eventType);
  const statusKey = findOptionKey(bookingStatusOptions, event.bookingStatus);
  const bookingTypeKey = findOptionKey(bookingTypeOptions, event.bookingType);
  const powerKey = powerSupplyKey(event.powerSupplyAccess);
  const services = serviceOptions.filter((service) => {
    return event.serviceIds.includes(service.id);
  });
  const mutation = useEventOverviewMutation(event.eventId);
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<{
    bookingStatus: BookingStatus;
    bookingType: BookingType;
    eventDate: string;
    guestCount: string;
    serviceStartTime: string;
  }>({
    bookingStatus: event.bookingStatus,
    bookingType: event.bookingType,
    eventDate: event.eventDate,
    guestCount: event.guestCount.toString(),
    serviceStartTime: event.serviceStartTime ?? "",
  });

  useEffect(() => {
    setValues({
      bookingStatus: event.bookingStatus,
      bookingType: event.bookingType,
      eventDate: event.eventDate,
      guestCount: event.guestCount.toString(),
      serviceStartTime: event.serviceStartTime ?? "",
    });
  }, [event.bookingStatus, event.bookingType, event.eventDate, event.guestCount, event.serviceStartTime]);

  const submit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    await mutation.mutate({
      bookingStatus: values.bookingStatus,
      bookingType: values.bookingType,
      eventDate: values.eventDate,
      guestCount: Number(values.guestCount),
      serviceStartTime: values.serviceStartTime || null,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5" onSubmit={submit}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">
            {t("crm.event.detail.section.event")}
          </h2>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex h-11 items-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" onClick={() => setIsEditing(false)} type="button">
                <X aria-hidden="true" size={16} />
                {t("crm.event.overview.action.cancel")}
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" type="submit">
                <Save aria-hidden="true" size={16} />
                {t("crm.event.overview.action.save")}
              </button>
            </div>
          ) : (
            <button className="inline-flex h-11 items-center gap-2 rounded-md border border-cyan-400/40 px-4 text-sm font-bold text-cyan-200" onClick={() => setIsEditing(true)} type="button">
              <Pencil aria-hidden="true" size={16} />
              {t("crm.event.overview.action.edit")}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="grid gap-5 md:grid-cols-2">
            <EventDetailField label={t("crm.event.detail.field.eventType")}>
              {eventTypeKey ? t(eventTypeKey) : t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("public.questionnaire.field.eventName")}>
              {event.eventName || t("common.notProvided")}
            </EventDetailField>
            <CrmTextInput label={t("crm.event.detail.field.eventDate")} onChange={(value) => setValues((current) => ({ ...current, eventDate: value }))} t={t} type="date" value={values.eventDate} />
            <CrmTextInput label={t("crm.event.detail.field.serviceStartTime")} onChange={(value) => setValues((current) => ({ ...current, serviceStartTime: value }))} placeholder={t("crm.event.overview.placeholder.serviceStartTime")} t={t} value={values.serviceStartTime} />
            <EventDetailField label={t("public.questionnaire.field.serviceEndTime")}>
              {event.serviceEndTime ?? t("common.notProvided")}
            </EventDetailField>
            <CrmTextInput label={t("crm.event.detail.field.guestCount")} onChange={(value) => setValues((current) => ({ ...current, guestCount: value }))} t={t} type="number" value={values.guestCount} />
            <EventDetailField label={t("public.questionnaire.field.marqueeNames")}>
              {event.marqueeSignNames || t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("public.questionnaire.field.eventHashtags")}>
              {event.eventHashtags || t("common.notProvided")}
            </EventDetailField>
            <CrmSelect label={t("crm.client.field.bookingStatus")} onChange={(value) => setValues((current) => ({ ...current, bookingStatus: value as BookingStatus }))} options={bookingStatusOptions.map((option) => ({ label: t(option.translationKey), value: option.value }))} placeholderKey="crm.event.overview.placeholder.select" t={t} value={values.bookingStatus} />
            <CrmSelect label={t("crm.client.field.bookingType")} onChange={(value) => setValues((current) => ({ ...current, bookingType: value as BookingType }))} options={bookingTypeOptions.map((option) => ({ label: t(option.translationKey), value: option.value }))} placeholderKey="crm.event.overview.placeholder.select" t={t} value={values.bookingType} />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <EventDetailField label={t("crm.event.detail.field.eventType")}>
              {eventTypeKey ? t(eventTypeKey) : t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("public.questionnaire.field.eventName")}>
              {event.eventName || t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("crm.event.detail.field.eventDate")}>
              {formatEventDate(event.eventDate, locale)}
            </EventDetailField>
            <EventDetailField label={t("crm.event.detail.field.serviceStartTime")}>
              {event.serviceStartTime ?? t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("public.questionnaire.field.serviceEndTime")}>
              {event.serviceEndTime ?? t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("crm.event.detail.field.guestCount")}>
              {event.guestCount}
            </EventDetailField>
            <EventDetailField label={t("public.questionnaire.field.marqueeNames")}>
              {event.marqueeSignNames || t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("public.questionnaire.field.eventHashtags")}>
              {event.eventHashtags || t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("crm.client.field.bookingStatus")}>
              {statusKey ? t(statusKey) : t("common.notProvided")}
            </EventDetailField>
            <EventDetailField label={t("crm.client.field.bookingType")}>
              {bookingTypeKey ? t(bookingTypeKey) : t("common.notProvided")}
            </EventDetailField>
          </div>
        )}

        <p aria-live="polite" className="text-sm font-medium text-zinc-400">
          {mutation.status === "success" ? t("crm.event.overview.saved") : null}
          {mutation.status === "error" ? t("crm.event.overview.error") : null}
        </p>
      </form>

      <EventDetailSection title={t("crm.event.detail.section.location")}>
        <dl className="grid gap-5 md:grid-cols-2">
          <EventDetailField label={t("crm.event.detail.field.venueName")}>
            {event.venueId ? (
              <Link className="text-cyan-200 hover:text-cyan-100" href={`/crm/venues/${event.venueId}`}>
                {event.venueName}
              </Link>
            ) : (
              event.venueName || t("common.notProvided")
            )}
          </EventDetailField>
          <EventDetailField label={t("public.questionnaire.field.serviceLocation")}>
            {event.serviceLocationDescription || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("public.questionnaire.field.powerSupply")}>
            {powerKey ? t(powerKey) : t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("public.questionnaire.field.powerNotes")}>
            {event.powerSupplyNotes || t("common.notProvided")}
          </EventDetailField>
        </dl>
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.detail.section.contacts")}>
        <div className="grid gap-3 md:grid-cols-2">
          {event.contacts.map((contact) => {
            const roleKey = findOptionKey(contactRoleOptions, contact.role);
            return (
              <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={contact.clientId}>
                <div className="flex items-start justify-between gap-3">
                  <Link className="font-bold text-cyan-200 hover:text-cyan-100" href={`/crm/clients/${contact.clientId}`}>
                    {contact.name}
                  </Link>
                  <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
                    {roleKey ? t(roleKey) : t("common.notProvided")}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                  <Mail aria-hidden="true" size={15} />
                  {contact.email}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                  <Phone aria-hidden="true" size={15} />
                  {formatPhone(contact.phone)}
                </p>
              </article>
            );
          })}
        </div>
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.detail.section.secondaryContacts")}>
        {event.secondaryContacts.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {event.secondaryContacts.map((contact) => (
              <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={contact.id}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-cyan-200">{contact.name || t("common.notProvided")}</h3>
                  <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
                    {contact.role || t("common.notProvided")}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                  <Mail aria-hidden="true" size={15} />
                  {contact.email || t("common.notProvided")}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                  <Phone aria-hidden="true" size={15} />
                  {contact.phone ? formatPhone(contact.phone) : t("common.notProvided")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{t("crm.event.detail.secondaryContacts.empty")}</p>
        )}
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.detail.section.services")}>
        <div className="flex flex-wrap gap-2">
          {services.length ? services.map((service) => (
            <span className="inline-flex items-center gap-1.5 rounded bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200" key={service.id}>
              <Tag aria-hidden="true" size={13} />
              {t(service.translationKey)}
            </span>
          )) : <span className="text-sm text-zinc-500">{t("crm.event.detail.empty.services")}</span>}
        </div>
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.detail.section.planners")}>
        {event.planners.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {event.planners.map((planner) => (
              <Link className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4 transition hover:border-cyan-300/40" href={`/crm/planners/${planner.plannerId}`} key={planner.id}>
                <p className="font-bold text-cyan-200">{planner.name}</p>
                <p className="mt-2 text-sm text-zinc-400">{planner.role}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            {t("crm.event.detail.empty.planners")}
          </p>
        )}
      </EventDetailSection>
    </div>
  );
}
