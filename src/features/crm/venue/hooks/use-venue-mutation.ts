"use client";

import { useCallback, useState } from "react";

import type { Venue, VenueFormValues } from "../types/venue";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useVenueMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: VenueFormValues) => {
      setStatus("loading");
      const enrichedValues = await enrichTravelValues(values);
      const response = await fetch(id ? `/api/crm/venues/${id}` : "/api/crm/venues", {
        body: JSON.stringify(enrichedValues),
        headers: { "Content-Type": "application/json" },
        method: id ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("venue_mutation_failed");
      }

      const payload = (await response.json()) as { data: Venue };
      setStatus("success");
      return payload.data;
    },
    [id],
  );

  return { mutate, resetStatus: () => setStatus("idle"), status };
}

export async function refreshVenueTravelValues(values: VenueFormValues) {
  if (!values.streetAddress.trim() && !values.city.trim()) return values;

  try {
    const settingsResponse = await fetch("/api/settings/travel");
    if (!settingsResponse.ok) return values;
    const settingsPayload = await settingsResponse.json() as { data?: { hqAddress?: string } };
    const origin = settingsPayload.data?.hqAddress?.trim();
    const destination = [values.streetAddress, values.city, values.stateProvince, values.country]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");
    if (!origin || !destination) return values;

    const distanceResponse = await fetch("/api/integrations/google-places", {
      body: JSON.stringify({ action: "distance", destination, origin }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!distanceResponse.ok) return values;

    const payload = await distanceResponse.json() as { data?: { distanceKm?: number; durationMinutes?: number } };
    if (payload.data?.distanceKm === undefined || payload.data.durationMinutes === undefined) return values;

    return {
      ...values,
      distanceFromHqKm: payload.data.distanceKm.toString(),
      travelTimeMinutes: payload.data.durationMinutes.toString(),
    };
  } catch {
    return values;
  }
}

async function enrichTravelValues(values: VenueFormValues) {
  if (values.distanceFromHqKm.trim() && values.travelTimeMinutes.trim()) {
    return values;
  }

  return refreshVenueTravelValues(values);
}
