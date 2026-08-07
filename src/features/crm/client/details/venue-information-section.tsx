import { MapPin, Phone } from "lucide-react";

import { formatPhone } from "../../shared/utils/phone-format";
import { ClientDetailField } from "./client-detail-field";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

const powerSupplyKey = (value: string) => {
  if (value === "yes") return "public.questionnaire.option.yes";
  if (value === "no") return "public.questionnaire.option.no";
  if (value === "not_sure") return "public.questionnaire.option.notSure";
  return null;
};

export function VenueInformationSection({ client, t }: ClientDetailSectionProps) {
  const event = client.event;

  if (!event) {
    return (
      <ClientDetailSection title={t("crm.client.detail.section.venue")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  const subLocation =
    event.venueSubLocationName || event.venueSubLocationOther || "";
  const powerKey = powerSupplyKey(event.powerSupplyAccess);

  return (
    <ClientDetailSection title={t("crm.client.detail.section.venue")}>
      <dl className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        <ClientDetailField label={t("crm.client.field.eventVenue")}>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" size={16} />
            {event.venueName || t("common.notProvided")}
          </span>
        </ClientDetailField>
        {event.venueUsesSubLocations ? (
          <ClientDetailField label={t("crm.event.runSheet.field.subLocation")}>
            {subLocation || t("common.notProvided")}
          </ClientDetailField>
        ) : null}
        <ClientDetailField label={t("crm.event.runSheet.field.venueContact")}>
          {event.eventVenueContactName || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.event.runSheet.field.contactPhone")}>
          <span className="inline-flex items-center gap-2">
            <Phone aria-hidden="true" size={16} />
            {event.eventVenueContactPhone
              ? formatPhone(event.eventVenueContactPhone)
              : t("common.notProvided")}
          </span>
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.serviceLocation")}>
          {event.serviceLocationDescription || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.powerSupply")}>
          {powerKey ? t(powerKey) : t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.powerNotes")}>
          {event.powerSupplyNotes || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.detail.field.paymentPartner")}>
          {event.paymentPartnerName || t("common.notProvided")}
        </ClientDetailField>
      </dl>
    </ClientDetailSection>
  );
}
