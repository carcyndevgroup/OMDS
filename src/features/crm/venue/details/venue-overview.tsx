import { ExternalLink, Globe, MapPin, Phone } from "lucide-react";

import { venueAreaOptions } from "../constants/venue-options";
import type { Venue } from "../types/venue";
import { VenueDetailField } from "./venue-detail-field";
import { VenueDetailSection } from "./venue-detail-section";
import type { Translate } from "../../shared/types/form-types";
import { formatPhone } from "../../shared/utils/phone-format";

type VenueOverviewProps = {
  t: Translate;
  venue: Venue;
};

const fieldValue = (value: string | number | null, fallback: string) => {
  return value || fallback;
};

const formatAddress = (venue: Venue) => {
  return [
    venue.streetAddress,
    [venue.city, venue.stateProvince, venue.postalCode].filter(Boolean).join(", "),
    venue.country,
  ].filter(Boolean);
};

export function VenueOverview({ t, venue }: VenueOverviewProps) {
  const area = venueAreaOptions.find((option) => option.value === venue.area);
  const fallback = t("common.notProvided");
  const address = formatAddress(venue);

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <VenueDetailSection
        description={t("crm.venue.detail.overviewDescription")}
        title={t("crm.venue.detail.overviewTitle")}
      >
        <VenueDetailField label={t("crm.venue.field.name")}>
          {venue.name}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.area")}>
          {area ? t(area.translationKey) : fallback}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.streetAddress")}>
          {address.length > 0 ? (
            <span className="block leading-7">
              {address.map((line) => (
                <span className="block" key={line}>{line}</span>
              ))}
            </span>
          ) : fallback}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.detail.contactInfo")}>
          <span className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2">
              <Phone aria-hidden="true" size={16} />
              {venue.phone ? formatPhone(venue.phone) : fallback}
            </span>
            {venue.websiteUrl ? (
              <a className="inline-flex items-center gap-2 text-cyan-200" href={venue.websiteUrl}>
                <Globe aria-hidden="true" size={16} />
                {t("crm.venue.field.websiteUrl")}
              </a>
            ) : null}
          </span>
        </VenueDetailField>
      </VenueDetailSection>

      <VenueDetailSection title={t("crm.venue.detail.locationTravel")}>
        <VenueDetailField label={t("crm.venue.field.googleMapsUrl")}>
          {venue.googleMapsUrl ? (
            <a className="inline-flex items-center gap-2 text-cyan-200" href={venue.googleMapsUrl}>
              <MapPin aria-hidden="true" size={16} />
              {t("crm.venue.detail.viewOnMaps")}
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : fallback}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.detail.travelFromHq")}>
          {[
            venue.distanceFromHqKm
              ? `${venue.distanceFromHqKm} ${t("crm.venue.detail.km")}`
              : "",
            venue.travelTimeMinutes
              ? `${venue.travelTimeMinutes} ${t("crm.venue.detail.mins")}`
              : "",
          ].filter(Boolean).join(" | ") || fallback}
        </VenueDetailField>
      </VenueDetailSection>

      <VenueDetailSection title={t("crm.venue.detail.operations")}>
        <VenueDetailField label={t("crm.venue.detail.relationship")}>
          {t(
            venue.isPreferredVendor
              ? "crm.venue.status.preferred"
              : "crm.venue.status.nonPreferred",
          )}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.requiresSatFiscal")}>
          {venue.requiresSatFiscal ? t("crm.venue.detail.yes") : t("crm.venue.detail.no")}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.usesSubLocations")}>
          {venue.usesSubLocations ? t("crm.venue.detail.yes") : t("crm.venue.detail.no")}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.paymentBillingType")}>
          {fieldValue(venue.paymentBillingType, fallback)}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.internalStatus")}>
          {t(
            venue.internalStatus === "active"
              ? "crm.venue.status.active"
              : "crm.venue.status.inactive",
          )}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.commissionNotes")}>
          {fieldValue(venue.commissionNotes, fallback)}
        </VenueDetailField>
        <VenueDetailField label={t("crm.venue.field.notes")}>
          {fieldValue(venue.notes, fallback)}
        </VenueDetailField>
      </VenueDetailSection>
    </div>
  );
}
