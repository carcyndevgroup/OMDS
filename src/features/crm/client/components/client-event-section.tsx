import { useEffect } from "react";

import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { eventTypeOptions } from "../../shared/constants/crm-options";
import type { EventType } from "../../shared/types/crm-options";
import { bookingTypeOptions } from "../constants/client-options";
import { useVenueEventOptions } from "../hooks/use-venue-event-options";
import { VenuePicker } from "../../venue/components/venue-picker";
import type { BookingType } from "../types/client";
import {
  addHoursToTime,
  customSubLocationValue,
} from "./client-event-form-utils";
import type { ClientSectionProps } from "./client-form-types";

export function ClientEventSection(props: ClientSectionProps) {
  const { errors, setFieldValue, t, values, venues } = props;
  const paymentPartners = venues.filter((venue) => venue.isPreferredVendor);
  const eventVenue = venues.find((venue) => venue.id === values.venueId);
  const eventVenueIsPreferred = eventVenue?.isPreferredVendor ?? false;
  const shouldUseSubLocations = eventVenue?.usesSubLocations ?? false;
  const venueOptions = useVenueEventOptions(values.venueId);
  const subLocationSelection =
    values.venueSubLocationId ||
    (values.venueSubLocationOther ? customSubLocationValue : "");

  const setBookingType = (value: string) => {
    if (eventVenueIsPreferred && value !== "preferred_vendor") {
      setFieldValue("bookingType", "preferred_vendor");
      setFieldValue("paymentPartnerVenueId", eventVenue?.id ?? "");
      return;
    }

    setFieldValue("bookingType", value as BookingType | "");
    if (value !== "preferred_vendor") {
      setFieldValue("paymentPartnerVenueId", "");
    }
  };

  const setVenue = (value: string) => {
    const venue = venues.find((item) => item.id === value);
    setFieldValue("venueId", venue?.id ?? "");
    setFieldValue("venueName", venue?.name ?? "");
    setFieldValue("venueSubLocationId", "");
    setFieldValue("venueSubLocationOther", "");
    setFieldValue("eventVenueContactId", "");

    if (venue?.isPreferredVendor) {
      setFieldValue("bookingType", "preferred_vendor");
      setFieldValue("paymentPartnerVenueId", venue.id);
    } else if (values.bookingType !== "preferred_vendor") {
      setFieldValue("bookingType", "direct");
    }
  };

  const setSubLocation = (value: string) => {
    if (value === customSubLocationValue) {
      setFieldValue("venueSubLocationId", customSubLocationValue);
      setFieldValue("venueSubLocationOther", "");
      return;
    }

    setFieldValue("venueSubLocationId", value);
    setFieldValue("venueSubLocationOther", "");
  };

  const setServiceStartTime = (value: string) => {
    const previousAutoEndTime = values.serviceStartTime
      ? addHoursToTime(values.serviceStartTime, 2)
      : "";
    const shouldAutoFillEndTime =
      !values.serviceEndTime || values.serviceEndTime === previousAutoEndTime;

    setFieldValue("serviceStartTime", value);
    if (shouldAutoFillEndTime) {
      setFieldValue("serviceEndTime", value ? addHoursToTime(value, 2) : "");
    }
  };

  useEffect(() => {
    if (values.venueId && !shouldUseSubLocations) {
      setFieldValue("venueSubLocationId", "");
      setFieldValue("venueSubLocationOther", "");
    }
  }, [setFieldValue, shouldUseSubLocations, values.venueId]);

  return (
    <CrmFormSection title={t("crm.client.section.eventDetails")}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">{t("crm.client.field.eventVenue")}</label>
        <VenuePicker
          name={values.venueName}
          onDraft={(draft) => {
            setFieldValue("venueId", "");
            setFieldValue("venueName", draft.name);
            setFieldValue("venueDraft", draft);
            setFieldValue("venueSubLocationId", "");
            setFieldValue("eventVenueContactId", "");
          }}
          onExisting={(venue) => {
            setVenue(venue.id);
            setFieldValue("venueDraft", null);
          }}
          t={t}
          venues={venues}
        />
        {errors.venueId ? <p className="mt-1 text-xs text-rose-300">{t(errors.venueId)}</p> : null}
      </div>
      <CrmSelect
        error={errors.bookingType}
        label={t("crm.client.field.bookingType")}
        onChange={setBookingType}
        options={bookingTypeOptions}
        placeholderKey="crm.client.placeholder.select"
        t={t}
        value={values.bookingType}
      />
      {values.venueId ? (
        <>
          {shouldUseSubLocations ? (
            <>
              <CrmSelect
                error={errors.venueSubLocationId}
                label={t("crm.client.field.venueSubLocation")}
                onChange={setSubLocation}
                options={[
                  ...venueOptions.subLocations
                    .filter((item) => item.isActive)
                    .map(({ id, name }) => ({ label: name, value: id })),
                  {
                    label: t("crm.client.option.subLocationNotListed"),
                    value: customSubLocationValue,
                  },
                ]}
                placeholderKey="crm.client.placeholder.selectSubLocation"
                t={t}
                value={subLocationSelection}
              />
              {subLocationSelection === customSubLocationValue ? (
                <CrmTextInput
                  error={errors.venueSubLocationOther}
                  label={t("crm.client.field.venueSubLocationOther")}
                  onChange={(value) => setFieldValue("venueSubLocationOther", value)}
                  t={t}
                  value={values.venueSubLocationOther}
                />
              ) : null}
            </>
          ) : null}
          <CrmSelect
            error={errors.eventVenueContactId}
            label={t("crm.client.field.eventVenueContact")}
            onChange={(value) => setFieldValue("eventVenueContactId", value)}
            options={venueOptions.contacts
              .filter((contact) => contact.isActive)
              .map((contact) => ({
                label: `${contact.name} - ${contact.role}`,
                value: contact.id,
              }))}
            placeholderKey="crm.client.placeholder.selectVenueContact"
            t={t}
            value={values.eventVenueContactId}
          />
        </>
      ) : null}
      {values.bookingType === "preferred_vendor" && !eventVenueIsPreferred ? (
        <CrmSelect
          error={errors.paymentPartnerVenueId}
          label={t("crm.client.field.paymentPartner")}
          onChange={(value) => setFieldValue("paymentPartnerVenueId", value)}
          options={paymentPartners.map(({ id, name }) => ({
            label: name,
            value: id,
          }))}
          placeholderKey="crm.client.placeholder.selectPaymentPartner"
          t={t}
          value={values.paymentPartnerVenueId}
        />
      ) : null}
      <CrmSelect
        error={errors.eventType}
        label={t("crm.lead.field.eventType")}
        onChange={(value) => setFieldValue("eventType", value as EventType | "")}
        options={eventTypeOptions}
        placeholderKey="crm.client.placeholder.select"
        t={t}
        value={values.eventType}
      />
      <CrmTextInput
        error={errors.eventDate}
        label={t("crm.lead.field.eventDate")}
        onChange={(value) => setFieldValue("eventDate", value)}
        t={t}
        type="date"
        value={values.eventDate}
      />
      <CrmTextInput
        error={errors.serviceStartTime}
        label={t("crm.client.field.serviceStartTime")}
        onChange={setServiceStartTime}
        t={t}
        type="time"
        value={values.serviceStartTime}
      />
      <CrmTextInput
        error={errors.serviceEndTime}
        label={t("crm.client.field.serviceEndTime")}
        onChange={(value) => setFieldValue("serviceEndTime", value)}
        t={t}
        type="time"
        value={values.serviceEndTime}
      />
      <CrmTextInput
        error={errors.guestCount}
        label={t("crm.lead.field.guestCount")}
        onChange={(value) => setFieldValue("guestCount", value)}
        t={t}
        type="number"
        value={values.guestCount}
      />
    </CrmFormSection>
  );
}
