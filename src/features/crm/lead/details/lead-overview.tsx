import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Tag,
  UsersRound,
} from "lucide-react";

import type { Locale, TranslationKey } from "@/core/i18n";

import type { Translate } from "../components/lead-form-types";
import {
  eventTypeOptions,
  leadRoleOptions,
  leadSourceOptions,
} from "../constants/lead-options";
import { serviceOptions } from "../../shared/constants/service-options";
import { formatPhone, phoneHref } from "../../shared/utils/phone-format";
import type { Lead } from "../types/lead";
import { LeadDetailField } from "./lead-detail-field";
import { LeadDetailSection } from "./lead-detail-section";
import { CrmActivityLog } from "../../shared/components/crm-activity-log";

type LeadOverviewProps = {
  lead: Lead;
  locale: Locale;
  t: Translate;
};

const findLabel = (
  options: { translationKey: TranslationKey; value: string }[],
  value: string,
) => {
  return options.find((option) => option.value === value)?.translationKey;
};

const formatDate = (value: string, locale: Locale) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
};

export function LeadOverview({ lead, locale, t }: LeadOverviewProps) {
  const roleKey = findLabel(leadRoleOptions, lead.role);
  const eventTypeKey = findLabel(eventTypeOptions, lead.eventType);
  const sourceKey = findLabel(leadSourceOptions, lead.leadSource);
  const services = serviceOptions.filter((option) => {
    return lead.serviceIds.includes(option.id);
  });

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
      <LeadDetailSection title={t("crm.lead.section.clientDetails")}>
        <LeadDetailField label={t("crm.lead.field.name")}>
          {lead.name}
        </LeadDetailField>
        <LeadDetailField label={t("crm.lead.field.role")}>
          {roleKey ? t(roleKey) : t("common.notProvided")}
        </LeadDetailField>
        <LeadDetailField label={t("crm.lead.field.email")}>
          <a
            className="inline-flex items-center gap-2 text-cyan-200 hover:text-cyan-100"
            href={`mailto:${lead.email}`}
          >
            <Mail aria-hidden="true" size={16} />
            {lead.email}
          </a>
        </LeadDetailField>
        <LeadDetailField label={t("crm.lead.field.phone")}>
          <a className="inline-flex items-center gap-2" href={phoneHref(lead.phone)}>
            <Phone aria-hidden="true" size={16} />
            {formatPhone(lead.phone)}
          </a>
        </LeadDetailField>
      </LeadDetailSection>

      <LeadDetailSection title={t("crm.lead.detail.section.venue")}>
        <LeadDetailField label={t("crm.lead.field.venueName")}>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" size={16} />
            {lead.venueName || t("common.notProvided")}
          </span>
        </LeadDetailField>
      </LeadDetailSection>

      <LeadDetailSection title={t("crm.lead.section.eventDetails")}>
        <LeadDetailField label={t("crm.lead.field.eventType")}>
          {eventTypeKey ? t(eventTypeKey) : t("common.notProvided")}
        </LeadDetailField>
        <LeadDetailField label={t("crm.lead.field.eventDate")}>
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" size={16} />
            {formatDate(lead.eventDate, locale)}
          </span>
        </LeadDetailField>
        <LeadDetailField label={t("crm.lead.field.guestCount")}>
          <span className="inline-flex items-center gap-2">
            <UsersRound aria-hidden="true" size={16} />
            {lead.guestCount}
          </span>
        </LeadDetailField>
      </LeadDetailSection>

      <LeadDetailSection title={t("crm.lead.section.servicesInterestedIn")}>
        <LeadDetailField
          hideLabel
          label={t("crm.lead.field.serviceIds")}
        >
          {services.length > 0 ? (
            <span className="flex flex-wrap gap-2">
              {services.map((service) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200"
                  key={service.id}
                >
                  <Tag aria-hidden="true" size={13} />
                  {t(service.translationKey)}
                </span>
              ))}
            </span>
          ) : (
            t("crm.lead.detail.empty.services")
          )}
        </LeadDetailField>
      </LeadDetailSection>

      <LeadDetailSection title={t("crm.lead.section.otherInformation")}>
        <LeadDetailField label={t("crm.lead.detail.label.inquiryDate")}>
          {formatDate(lead.createdAt, locale)}
        </LeadDetailField>
        <LeadDetailField label={t("crm.lead.field.leadSource")}>
          {sourceKey ? t(sourceKey) : t("common.notProvided")}
        </LeadDetailField>
      </LeadDetailSection>
      <CrmActivityLog entity="leads" id={lead.id} t={t} />
    </div>
  );
}
