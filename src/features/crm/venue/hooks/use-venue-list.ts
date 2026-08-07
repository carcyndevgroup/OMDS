"use client";

import { useEffect, useState } from "react";

import type { Venue } from "../types/venue";

type VenueResponse = { data: Venue[] };

export function useVenueList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/crm/venues", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("venue_list_failed");
        return response.json() as Promise<VenueResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          const sortedVenues = [...result.data].sort((a, b) => {
            if (a.isPreferredVendor === b.isPreferredVendor) return 0;
            return a.isPreferredVendor ? -1 : 1;
          });
          setVenues(sortedVenues);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { hasError, isLoading, venues };
}
