"use client";

import { useCallback, useState } from "react";

import type { VenueSubLocationFormValues } from "../types/venue-sub-location";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useVenueSubLocationMutation(
  venueId: string,
  subLocationId?: string,
) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: VenueSubLocationFormValues) => {
      setStatus("loading");
      const endpoint = subLocationId
        ? `/api/crm/venues/${venueId}/sub-locations/${subLocationId}`
        : `/api/crm/venues/${venueId}/sub-locations`;

      const response = await fetch(endpoint, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: subLocationId ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("venue_sub_location_mutation_failed");
      }

      setStatus("success");
    },
    [subLocationId, venueId],
  );

  return { mutate, status };
}
