"use client";

import { useEffect, useState } from "react";

import type { Venue } from "../../venue/types/venue";

type VenueResponse = {
  data?: Venue[];
};

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/crm/venues", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("venues_load_failed");
        return response.json() as Promise<VenueResponse>;
      })
      .then((result) => setVenues(result.data ?? []))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setVenues([]);
      });

    return () => controller.abort();
  }, []);

  return venues;
}
