import { ExternalLink, FileText, Printer, Tag } from "lucide-react";
import Link from "next/link";

import { equipmentCategoryOptions } from "@/features/settings/equipment/constants/equipment-options";

import { serviceOptions } from "../../shared/constants/service-options";
import {
  eventStaffPositionOptions,
  runSheetStaffPositions,
} from "../../staff/constants/staff-options";
import { formatPhone } from "../../shared/utils/phone-format";
import { EventDetailField } from "./event-detail-field";
import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";
import { buildEventTimeline } from "./event-timeline-utils";

const formatTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const powerSupplyKey = (value: string) => {
  if (value === "yes") return "public.questionnaire.option.yes";
  if (value === "no") return "public.questionnaire.option.no";
  if (value === "not_sure") return "public.questionnaire.option.notSure";
  return null;
};

export function EventRunSheetTab({
  event,
  locale,
  t,
}: EventDetailSectionProps) {
  const services = serviceOptions.filter((service) => {
    return event.serviceIds.includes(service.id);
  });
  const timeline = buildEventTimeline(event);
  const subLocation = event.venueSubLocationName || event.venueSubLocationOther;
  const powerKey = powerSupplyKey(event.powerSupplyAccess);
  const runSheetStaff = event.staffAssignments.filter((assignment) => {
    return runSheetStaffPositions.includes(assignment.position);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-cyan-300/40 px-4 py-2 text-sm font-black text-cyan-200 transition hover:border-cyan-200 hover:bg-cyan-300/10"
          href={`/run-sheets/${event.eventId}`}
          rel="noreferrer"
          target="_blank"
        >
          <Printer aria-hidden="true" size={16} />
          {t("crm.event.runSheet.print.open")}
        </Link>
      </div>
      <EventDetailSection title={t("crm.event.runSheet.section.venue")}>
        <dl className="grid gap-5 md:grid-cols-2">
          <EventDetailField label={t("crm.event.detail.field.venueName")}>
            {event.venueName || t("common.notProvided")}
          </EventDetailField>
          {event.venueUsesSubLocations ? (
            <EventDetailField label={t("crm.event.runSheet.field.subLocation")}>
              {subLocation || t("common.notProvided")}
            </EventDetailField>
          ) : null}
          <EventDetailField label={t("crm.event.runSheet.field.area")}>
            {event.venueArea || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("crm.event.runSheet.field.address")}>
            {event.venueAddress || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("crm.event.runSheet.field.venueContact")}>
            {event.eventVenueContactName || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("crm.event.runSheet.field.contactPhone")}>
            {event.eventVenueContactPhone
              ? formatPhone(event.eventVenueContactPhone)
              : t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("crm.event.runSheet.field.contactRole")}>
            {event.eventVenueContactRole || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("crm.event.runSheet.field.venueNotes")}>
            {event.venueNotes || t("common.notProvided")}
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

      <EventDetailSection title={t("crm.event.runSheet.section.contacts")}>
        <div className="grid gap-3 md:grid-cols-2">
          {event.contacts.slice(0, 2).map((contact) => (
            <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={contact.clientId}>
              <p className="font-bold text-cyan-200">{contact.name}</p>
              <p className="mt-2 text-sm text-zinc-400">{formatPhone(contact.phone)}</p>
            </article>
          ))}
          {event.planners.map((planner) => (
            <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={planner.id}>
              <p className="font-bold text-cyan-200">{planner.name}</p>
              <p className="mt-2 text-sm text-zinc-400">
                {planner.phone ? formatPhone(planner.phone) : t("common.notProvided")}
              </p>
            </article>
          ))}
        </div>
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.runSheet.section.timeline")}>
        {timeline.length ? (
          <ol className="space-y-3">
            {timeline.map((item) => (
              <li className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 sm:grid-cols-[9rem_1fr]" key={item.titleKey}>
                <p className="text-sm font-bold text-cyan-200">
                  {formatTime(item.startsAt, locale)}
                  {item.endsAt ? ` - ${formatTime(item.endsAt, locale)}` : ""}
                </p>
                <div>
                  <h3 className="font-bold text-white">{t(item.titleKey)}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{t(item.descriptionKey)}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-zinc-500">
            {t("crm.event.timeline.empty.startTime")}
          </p>
        )}
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.runSheet.section.services")}>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span className="inline-flex items-center gap-1.5 rounded bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200" key={service.id}>
              <Tag aria-hidden="true" size={13} />
              {t(service.translationKey)}
            </span>
          ))}
        </div>
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.runSheet.section.staff")}>
        {runSheetStaff.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {runSheetStaff.map((assignment) => {
              const positionKey = eventStaffPositionOptions.find(
                (option) => option.value === assignment.position,
              )?.translationKey;
              return (
                <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={assignment.id}>
                  <p className="font-bold text-cyan-200">
                    {positionKey ? t(positionKey) : assignment.position}
                  </p>
                  <p className="mt-2 text-sm text-zinc-300">{assignment.staffName}</p>
                  <p className="mt-1 text-sm text-zinc-500">{formatPhone(assignment.staffPhone)}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            {t("crm.event.runSheet.placeholder.staff")}
          </p>
        )}
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.runSheet.section.equipment")}>
        {event.equipmentAssignments.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {event.equipmentAssignments.map((assignment) => {
              const categoryKey = equipmentCategoryOptions.find((option) => {
                return option.value === assignment.equipmentCategory;
              })?.translationKey;
              return (
                <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={assignment.id}>
                  <p className="font-bold text-cyan-200">
                    {assignment.equipmentName}
                  </p>
                  {categoryKey ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{t(categoryKey)}</p> : null}
                  {assignment.notes ? <p className="mt-2 text-sm text-zinc-500">{assignment.notes}</p> : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            {t("crm.event.runSheet.placeholder.equipment")}
          </p>
        )}
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.runSheet.section.files")}>
        {event.filesToInclude.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {event.filesToInclude.map((file) => (
              <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={file.id}>
                <a className="inline-flex items-center gap-2 font-bold text-cyan-200" href={file.fileUrl} rel="noreferrer" target="_blank">
                  <ExternalLink aria-hidden="true" size={16} />
                  {file.fileName}
                </a>
                {file.notes ? <p className="mt-2 text-sm text-zinc-500">{file.notes}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-md border border-dashed border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-500">
            <FileText aria-hidden="true" size={16} />
            {t("crm.event.runSheet.placeholder.files")}
          </p>
        )}
      </EventDetailSection>

      <EventDetailSection title={t("crm.event.runSheet.section.notes")}>
        <dl className="grid gap-5 md:grid-cols-2">
          <EventDetailField label={t("crm.client.field.operationsNotes")}>
            {event.operationsNotes || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("public.questionnaire.field.specialRequests")}>
            {event.specialRequests || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("public.questionnaire.field.operationalNotes")}>
            {event.clientOperationalNotes || t("common.notProvided")}
          </EventDetailField>
          <EventDetailField label={t("crm.client.field.internalIssueNotes")}>
            {event.internalIssueNotes || t("common.notProvided")}
          </EventDetailField>
        </dl>
      </EventDetailSection>
    </div>
  );
}
