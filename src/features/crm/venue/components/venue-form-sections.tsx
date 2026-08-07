"use client";

import { useTranslation } from "@/core/i18n";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { PhoneInput } from "../../shared/components/phone-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { venueAreaOptions, venueStatusOptions } from "../constants/venue-options";
import type { useVenueForm } from "../hooks/use-venue-form";
import { refreshVenueTravelValues } from "../hooks/use-venue-mutation";
import { VenuePlaceAutocomplete } from "./venue-place-autocomplete";

type VenueFormState = ReturnType<typeof useVenueForm>;
type VenueSectionProps = { form: VenueFormState };

export function VenueCoreFields({ form }: VenueSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <CrmTextInput
          error={form.errors.name}
          label={t("crm.venue.field.name")}
          onChange={(value) => form.setField("name", value)}
          placeholder={t("crm.venue.placeholder.name")}
          t={t}
          value={form.values.name}
        />
        <VenuePlaceAutocomplete setField={form.setField} value={form.values.name} />
      </div>
      <CrmTextInput
        label={t("crm.venue.field.streetAddress")}
        onChange={(value) => form.setField("streetAddress", value)}
        t={t}
        value={form.values.streetAddress}
      />
    </div>
  );
}

export function VenueLocationFields({ form }: VenueSectionProps) {
  const { t } = useTranslation();
  const refreshTravel = async () => {
    const values = await refreshVenueTravelValues(form.values);
    form.setField("distanceFromHqKm", values.distanceFromHqKm);
    form.setField("travelTimeMinutes", values.travelTimeMinutes);
  };

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <CrmSelect
        error={form.errors.area}
        label={t("crm.venue.field.area")}
        onChange={(value) => form.setField("area", value)}
        options={venueAreaOptions}
        placeholderKey="crm.venue.placeholder.area"
        t={t}
        value={form.values.area}
      />
      <CrmTextInput label={t("crm.venue.field.city")} onChange={(value) => form.setField("city", value)} t={t} value={form.values.city} />
      <CrmTextInput label={t("crm.venue.field.stateProvince")} onChange={(value) => form.setField("stateProvince", value)} t={t} value={form.values.stateProvince} />
      <CrmTextInput label={t("crm.venue.field.postalCode")} onChange={(value) => form.setField("postalCode", value)} t={t} value={form.values.postalCode} />
      <CrmTextInput label={t("crm.venue.field.country")} onChange={(value) => form.setField("country", value)} t={t} value={form.values.country} />
      <CrmTextInput label={t("crm.venue.field.distanceFromHqKm")} onChange={(value) => form.setField("distanceFromHqKm", value)} t={t} type="number" value={form.values.distanceFromHqKm} />
      <CrmTextInput label={t("crm.venue.field.travelTimeMinutes")} onChange={(value) => form.setField("travelTimeMinutes", value)} t={t} type="number" value={form.values.travelTimeMinutes} />
      <button className="h-11 self-end rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:bg-white/[0.04]" onClick={() => void refreshTravel()} type="button">
        {t("crm.venue.action.refreshTravel")}
      </button>
      <CrmTextInput label={t("crm.venue.field.googleMapsUrl")} onChange={(value) => form.setField("googleMapsUrl", value)} t={t} type="url" value={form.values.googleMapsUrl} />
      <CrmSelect
        label={t("crm.venue.field.internalStatus")}
        onChange={(value) => {
          form.setField("internalStatus", value === "inactive" ? "inactive" : "active");
        }}
        options={venueStatusOptions}
        t={t}
        value={form.values.internalStatus}
      />
    </div>
  );
}

export function VenuePolicyFields({ form }: VenueSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <label className="flex items-start gap-3 text-sm font-bold text-zinc-200">
        <input
          checked={form.values.isPreferredVendor}
          className="mt-1 h-4 w-4 accent-cyan-300"
          onChange={(event) => form.setField("isPreferredVendor", event.target.checked)}
          type="checkbox"
        />
        <span>
          {t("crm.venue.field.preferredVendor")}
          <span className="mt-1 block font-medium text-zinc-500">
            {t("crm.venue.help.preferredVendor")}
          </span>
        </span>
      </label>
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input
          checked={form.values.requiresSatFiscal}
          className="h-4 w-4 accent-cyan-300"
          onChange={(event) => form.setField("requiresSatFiscal", event.target.checked)}
          type="checkbox"
        />
        {t("crm.venue.field.requiresSatFiscal")}
      </label>
      <label className="flex items-start gap-3 text-sm font-bold text-zinc-200">
        <input
          checked={form.values.usesSubLocations}
          className="mt-1 h-4 w-4 accent-cyan-300"
          onChange={(event) => form.setField("usesSubLocations", event.target.checked)}
          type="checkbox"
        />
        <span>
          {t("crm.venue.field.usesSubLocations")}
          <span className="mt-1 block font-medium text-zinc-500">
            {t("crm.venue.help.usesSubLocations")}
          </span>
        </span>
      </label>
    </div>
  );
}

export function VenueContactFields({ form }: VenueSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <CrmTextInput label={t("crm.venue.field.websiteUrl")} onChange={(value) => form.setField("websiteUrl", value)} placeholder={t("crm.venue.placeholder.website")} t={t} type="url" value={form.values.websiteUrl} />
      <PhoneInput label={t("crm.venue.field.phone")} onChange={(value) => form.setField("phone", value)} t={t} value={form.values.phone} />
      <CrmTextInput label={t("crm.venue.field.instagram")} onChange={(value) => form.setField("instagram", value)} placeholder={t("crm.venue.placeholder.instagram")} t={t} value={form.values.instagram} />
      <CrmTextInput label={t("crm.venue.field.facebook")} onChange={(value) => form.setField("facebook", value)} placeholder={t("crm.venue.placeholder.facebook")} t={t} value={form.values.facebook} />
      <CrmTextInput label={t("crm.venue.field.paymentBillingType")} onChange={(value) => form.setField("paymentBillingType", value)} t={t} value={form.values.paymentBillingType} />
    </div>
  );
}

export function VenueNotesFields({ form }: VenueSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <CrmTextarea label={t("crm.venue.field.commissionNotes")} onChange={(value) => form.setField("commissionNotes", value)} placeholder={t("crm.venue.placeholder.commissionNotes")} t={t} value={form.values.commissionNotes} />
      <CrmTextarea label={t("crm.venue.field.notes")} onChange={(value) => form.setField("notes", value)} placeholder={t("crm.venue.placeholder.notes")} t={t} value={form.values.notes} />
    </>
  );
}
