import type { ReactNode } from "react";

import type { Locale } from "@/core/i18n";

import { equipmentCategoryOptions } from "@/features/settings/equipment/constants/equipment-options";

import { serviceOptions } from "../../shared/constants/service-options";
import type { Translate } from "../../shared/types/form-types";
import { formatPhone } from "../../shared/utils/phone-format";
import { eventStaffPositionOptions } from "../../staff/constants/staff-options";
import type { StaffPosition } from "../../staff/types/staff";
import type { EventDetail } from "../types/event";
import { formatEventDate } from "./event-detail-types";
import { buildEventTimeline } from "./event-timeline-utils";

type PrintDocumentProps = {
  event: EventDetail;
  locale: Locale;
  t: Translate;
};

type PrintSectionProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

const staffSlots: StaffPosition[] = [
  "driver_a",
  "driver_b",
  "operator_1",
  "operator_2",
  "operator_3",
  "operator_4",
  "operator_5",
  "operator_6",
];

const clock = (value: string | null) => (value ? value.slice(0, 5) : "");

const formatTime = (date: Date, locale: Locale) => {
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

function PrintSection({ children, className = "", title }: PrintSectionProps) {
  return (
    <section className={`break-inside-avoid ${className}`}>
      <h2 className="mb-1.5 border-b border-zinc-300 pb-1 text-center text-[13px] font-black text-zinc-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2 text-[11px] leading-snug">
      <dt className="font-black text-zinc-600">{label}</dt>
      <dd className="font-semibold text-zinc-950">{value}</dd>
    </div>
  );
}

function compactValue(value: string | null | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

export function EventRunSheetPrintDocument(props: PrintDocumentProps) {
  const { event, locale, t } = props;
  const services = serviceOptions.filter((service) => event.serviceIds.includes(service.id));
  const timeline = buildEventTimeline(event);
  const subLocation = event.venueSubLocationName || event.venueSubLocationOther;
  const powerKey = powerSupplyKey(event.powerSupplyAccess);
  const empty = t("common.notProvided");
  const serviceText = services.length
    ? services.map((service) => t(service.translationKey)).join(" / ")
    : t("crm.event.detail.empty.services");
  const primaryContact = event.contacts[0];
  const secondaryContact = event.contacts[1];

  return (
    <article className="mx-auto max-w-5xl bg-white p-5 text-zinc-950 print:max-w-none print:p-0">
      <header className="mb-3 text-center">
        <p className="text-lg font-black">{t("brand.name")}</p>
        <p className="text-sm font-bold">
          {event.clientName} - {formatEventDate(event.eventDate, locale)}
          {event.serviceStartTime ? ` - ${clock(event.serviceStartTime)}` : ""}
          {` - ${event.guestCount} ${t("crm.event.list.guests")}`}
        </p>
        {event.eventName ? <p className="text-xs font-semibold text-zinc-600">{event.eventName}</p> : null}
      </header>

      <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
        <PrintSection title={t("crm.event.runSheet.section.venue")}>
          <dl className="space-y-1">
            <Field label={t("crm.event.detail.field.venueName")} value={compactValue(event.venueName, empty)} />
            {event.venueUsesSubLocations ? (
              <Field label={t("crm.event.runSheet.field.subLocation")} value={compactValue(subLocation, empty)} />
            ) : null}
            <Field label={t("crm.event.runSheet.field.area")} value={compactValue(event.venueArea, empty)} />
            <Field label={t("crm.event.runSheet.field.address")} value={compactValue(event.venueAddress, empty)} />
            <Field label={t("crm.event.runSheet.field.venueContact")} value={compactValue(event.eventVenueContactName, empty)} />
            <Field label={t("crm.event.runSheet.field.contactPhone")} value={event.eventVenueContactPhone ? formatPhone(event.eventVenueContactPhone) : empty} />
            <Field label={t("crm.event.runSheet.field.contactRole")} value={compactValue(event.eventVenueContactRole, empty)} />
            <Field label={t("public.questionnaire.field.serviceLocation")} value={compactValue(event.serviceLocationDescription, empty)} />
            <Field label={t("public.questionnaire.field.powerSupply")} value={powerKey ? t(powerKey) : empty} />
            <Field label={t("public.questionnaire.field.powerNotes")} value={compactValue(event.powerSupplyNotes, empty)} />
          </dl>
        </PrintSection>

        <PrintSection title={t("crm.event.runSheet.section.contacts")}>
          <dl className="space-y-1">
            <Field label={t("crm.client.detail.field.printClient1")} value={primaryContact?.name || empty} />
            <Field label={t("crm.event.runSheet.field.contactPhone")} value={primaryContact?.phone ? formatPhone(primaryContact.phone) : empty} />
            <Field label={t("crm.client.detail.field.printClient2")} value={secondaryContact?.name || empty} />
            <Field label={t("crm.event.runSheet.field.contactPhone")} value={secondaryContact?.phone ? formatPhone(secondaryContact.phone) : empty} />
            <Field label={t("public.questionnaire.field.marqueeNames")} value={compactValue(event.marqueeSignNames, empty)} />
            {event.planners.slice(0, 2).map((planner) => (
              <Field
                key={planner.id}
                label={t("crm.client.planner.field.planner")}
                value={`${planner.name}${planner.phone ? ` - ${formatPhone(planner.phone)}` : ""}`}
              />
            ))}
          </dl>
        </PrintSection>
      </div>

      <PrintSection className="mt-3" title={t("crm.event.runSheet.section.timeline")}>
        {timeline.length ? (
          <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
            {timeline.map((item) => (
              <div className="grid grid-cols-[7.5rem_1fr] gap-2 text-[11px]" key={item.titleKey}>
                <span className="font-black text-cyan-700">
                  {formatTime(item.startsAt, locale)}
                  {item.endsAt ? ` - ${formatTime(item.endsAt, locale)}` : ""}
                </span>
                <span className="font-semibold">{t(item.titleKey)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[11px] font-semibold text-zinc-600">{t("crm.event.timeline.empty.startTime")}</p>
        )}
      </PrintSection>

      <PrintSection className="mt-3" title={t("crm.event.runSheet.section.services")}>
        <p className="text-center text-xs font-black text-cyan-700">{serviceText}</p>
      </PrintSection>

      <PrintSection className="mt-3" title={t("crm.event.runSheet.section.staff")}>
        <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {staffSlots.map((slot) => {
            const assignment = event.staffAssignments.find((item) => item.position === slot);
            const labelKey = eventStaffPositionOptions.find((option) => option.value === slot)?.translationKey;
            return (
              <Field
                key={slot}
                label={labelKey ? t(labelKey) : slot}
                value={assignment ? `${assignment.staffName} - ${formatPhone(assignment.staffPhone)}` : ""}
              />
            );
          })}
        </div>
      </PrintSection>

      <PrintSection className="mt-3" title={t("crm.event.runSheet.section.equipment")}>
        {event.equipmentAssignments.length ? (
          <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
            {event.equipmentAssignments.map((assignment) => {
              const categoryKey = equipmentCategoryOptions.find((option) => {
                return option.value === assignment.equipmentCategory;
              })?.translationKey;
              return (
                <Field
                  key={assignment.id}
                  label={categoryKey ? t(categoryKey) : assignment.equipmentCategory}
                  value={`${assignment.equipmentName}${assignment.notes ? ` - ${assignment.notes}` : ""}`}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[11px] font-semibold text-zinc-600">{t("crm.event.runSheet.placeholder.equipment")}</p>
        )}
      </PrintSection>

      <PrintSection className="mt-3" title={t("crm.event.runSheet.section.notes")}>
        <dl className="space-y-1">
          <Field label={t("crm.client.field.operationsNotes")} value={compactValue(event.operationsNotes, empty)} />
          <Field label={t("public.questionnaire.field.specialRequests")} value={compactValue(event.specialRequests, empty)} />
          <Field label={t("public.questionnaire.field.operationalNotes")} value={compactValue(event.clientOperationalNotes, empty)} />
          <Field label={t("crm.client.field.internalIssueNotes")} value={compactValue(event.internalIssueNotes, empty)} />
        </dl>
      </PrintSection>

      {event.filesToInclude.length ? (
        <PrintSection className="mt-4 break-before-page" title={t("crm.event.runSheet.section.files")}>
          <ul className="space-y-2 text-xs font-semibold">
            {event.filesToInclude.map((file) => (
              <li className="rounded border border-zinc-300 p-2" key={file.id}>
                <p className="font-black text-cyan-700">{file.fileName}</p>
                <p className="break-all text-zinc-700">{file.fileUrl}</p>
                {file.notes ? <p className="mt-1 text-zinc-600">{file.notes}</p> : null}
              </li>
            ))}
          </ul>
        </PrintSection>
      ) : null}
    </article>
  );
}
