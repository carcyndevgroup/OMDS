"use client";

import { useTranslation } from "@/core/i18n";

import { VenueForm } from "../components/venue-form";
import { VenuePageHeader } from "../components/venue-page-header";
import { useVenueMutation } from "../hooks/use-venue-mutation";
import { initialVenueFormValues } from "../schemas/venue-schema";
import type { VenueFormValues } from "../types/venue";

export function VenueCreate() {
  const { t } = useTranslation();
  const mutation = useVenueMutation();
  const createVenue = async (values: VenueFormValues) => {
    const venue = await mutation.mutate(values);
    window.location.assign(`/crm/venues/${venue.id}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <VenuePageHeader
          backLabel={t("crm.venue.action.back")}
          subtitle={t("crm.venue.new.subtitle")}
          title={t("crm.venue.new.title")}
        />
        <VenueForm
          cancelHref="/crm/venues"
          errorKey="crm.venue.message.createError"
          initialValues={initialVenueFormValues}
          onSubmit={createVenue}
          status={mutation.status}
          submitKey="crm.venue.action.create"
          submittingKey="crm.venue.action.creating"
          successKey="crm.venue.message.created"
        />
      </div>
    </main>
  );
}
