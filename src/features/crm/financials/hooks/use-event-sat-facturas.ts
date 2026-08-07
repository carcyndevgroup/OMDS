"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventSatFactura } from "../types/event-sat-factura";

export function useEventSatFacturas(eventId: string) {
  const [facturas, setFacturas] = useState<EventSatFactura[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/events/${eventId}/sat-facturas`);
      if (!response.ok) throw new Error("event_sat_facturas_load_failed");
      const payload = (await response.json()) as { data: EventSatFactura[] };
      setFacturas(payload.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { facturas, hasError, isLoading, refresh };
}
