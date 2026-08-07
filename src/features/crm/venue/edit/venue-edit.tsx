"use client";

import { useTranslation } from "@/core/i18n";

import { VenueForm } from "../components/venue-form";
import { VenuePageHeader } from "../components/venue-page-header";
import { useVenue } from "../hooks/use-venue";
import { useVenueMutation } from "../hooks/use-venue-mutation";

type VenueEditProps = { id: string };

export function VenueEdit({ id }: VenueEditProps) {
  const { t } = useTranslation();
  const state = useVenue(id);
  const mutation = useVenueMutation(id);

  if (state.isLoading) {
    return <p className="py-12 text-center text-sm text-zinc-500">{t("crm.venue.list.loading")}</p>;
  }
  if (state.hasError || !state.venue) {
    return <p className="py-12 text-center text-sm text-rose-300">{t("crm.venue.list.loadError")}</p>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <VenuePageHeader
          backLabel={t("crm.venue.action.back")}
          subtitle={t("crm.venue.edit.subtitle")}
          title={t("crm.venue.edit.title")}
        />
        <VenueForm
          cancelHref={`/crm/venues/${id}`}
          errorKey="crm.venue.edit.error"
          initialValues={{
            area: state.venue.area,
            city: state.venue.city,
            commissionNotes: state.venue.commissionNotes,
            country: state.venue.country,
            distanceFromHqKm: state.venue.distanceFromHqKm?.toString() ?? "",
            facebook: state.venue.facebook,
            googleMapsUrl: state.venue.googleMapsUrl,
            instagram: state.venue.instagram,
            internalStatus: state.venue.internalStatus,
            isPreferredVendor: state.venue.isPreferredVendor,
            name: state.venue.name,
            notes: state.venue.notes,
            paymentBillingType: state.venue.paymentBillingType,
            phone: state.venue.phone,
            postalCode: state.venue.postalCode,
            requiresSatFiscal: state.venue.requiresSatFiscal,
            stateProvince: state.venue.stateProvince,
            streetAddress: state.venue.streetAddress,
            travelTimeMinutes: state.venue.travelTimeMinutes?.toString() ?? "",
            usesSubLocations: state.venue.usesSubLocations,
            websiteUrl: state.venue.websiteUrl,
          }}
          onSubmit={mutation.mutate}
          onSuccess={() => window.location.assign(`/crm/venues/${id}`)}
          status={mutation.status}
          submitKey="crm.venue.action.save"
          submittingKey="crm.venue.action.saving"
          successKey="crm.venue.edit.success"
        />
      </div>
    </main>
  );
}
