"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useVenueSubLocationMutation } from "../hooks/use-venue-sub-location-mutation";
import { useVenueSubLocations } from "../hooks/use-venue-sub-locations";
import { initialVenueSubLocationFormValues } from "../schemas/venue-sub-location-schema";
import type {
  VenueSubLocation,
  VenueSubLocationFormValues,
} from "../types/venue-sub-location";
import { VenueSubLocationCard } from "./venue-sub-location-card";
import { VenueSubLocationForm } from "./venue-sub-location-form";

type VenueSubLocationsTabProps = { venueId: string };

const toFormValues = (
  subLocation: VenueSubLocation,
): VenueSubLocationFormValues => ({
  isActive: subLocation.isActive,
  name: subLocation.name,
  notes: subLocation.notes,
});

export function VenueSubLocationsTab({ venueId }: VenueSubLocationsTabProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<VenueSubLocation | null>(null);
  const subLocations = useVenueSubLocations(venueId);
  const createMutation = useVenueSubLocationMutation(venueId);
  const updateMutation = useVenueSubLocationMutation(venueId, editing?.id);

  const createSubLocation = async (values: VenueSubLocationFormValues) => {
    await createMutation.mutate(values);
    setIsAdding(false);
    await subLocations.refresh();
  };

  const updateSubLocation = async (values: VenueSubLocationFormValues) => {
    await updateMutation.mutate(values);
    setEditing(null);
    await subLocations.refresh();
  };

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("crm.venue.subLocation.title")}</h2>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            {t("crm.venue.subLocation.subtitle")}
          </p>
        </div>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={() => setIsAdding(true)} type="button">
          <Plus aria-hidden="true" size={17} />
          {t("crm.venue.subLocation.action.add")}
        </button>
      </div>

      {isAdding ? (
        <VenueSubLocationForm initialValues={initialVenueSubLocationFormValues} onCancel={() => setIsAdding(false)} onSubmit={createSubLocation} submitLabel={t("crm.venue.subLocation.action.save")} />
      ) : null}

      {editing ? (
        <VenueSubLocationForm initialValues={toFormValues(editing)} onCancel={() => setEditing(null)} onSubmit={updateSubLocation} submitLabel={t("crm.venue.subLocation.action.update")} />
      ) : null}

      {subLocations.isLoading ? (
        <p className="text-sm text-zinc-500">{t("crm.venue.subLocation.loading")}</p>
      ) : null}
      {subLocations.hasError ? (
        <p className="text-sm text-rose-300">{t("crm.venue.subLocation.loadError")}</p>
      ) : null}
      {!subLocations.isLoading && subLocations.subLocations.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm font-medium text-zinc-500">
          {t("crm.venue.subLocation.empty")}
        </p>
      ) : null}
      <div className="grid gap-4">
        {subLocations.subLocations.map((subLocation) => (
          <VenueSubLocationCard
            key={subLocation.id}
            onEdit={setEditing}
            subLocation={subLocation}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
