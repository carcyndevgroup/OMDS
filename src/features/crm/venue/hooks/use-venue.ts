"use client";

import { useEffect, useState } from "react";

import type { Venue } from "../types/venue";

type VenueResponse = { data: Venue };

export function useVenue(id: string) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/crm/venues/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("venue_load_failed");
        return response.json() as Promise<VenueResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setVenue(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, venue };
}
