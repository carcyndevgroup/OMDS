"use client";

import { useCallback, useState } from "react";

import type { VenueSettingsFormValues } from "../types/venue";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useVenueSettingsMutation(venueId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: VenueSettingsFormValues) => {
      setStatus("loading");
      const response = await fetch(`/api/crm/venues/${venueId}/settings`, {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("venue_settings_update_failed");
      }

      setStatus("success");
    },
    [venueId],
  );

  return { mutate, status };
}
