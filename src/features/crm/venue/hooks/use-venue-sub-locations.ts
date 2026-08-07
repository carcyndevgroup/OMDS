"use client";

import { useCallback, useEffect, useState } from "react";

import type { VenueSubLocation } from "../types/venue-sub-location";

export function useVenueSubLocations(venueId: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subLocations, setSubLocations] = useState<VenueSubLocation[]>([]);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/venues/${venueId}/sub-locations`);
      if (!response.ok) throw new Error("venue_sub_locations_load_failed");
      const payload = (await response.json()) as { data: VenueSubLocation[] };
      setSubLocations(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasError, isLoading, refresh, subLocations };
}
