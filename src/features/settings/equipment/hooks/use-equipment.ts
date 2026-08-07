"use client";

import { useEffect, useState } from "react";

import type { EquipmentItem } from "../types/equipment";

export function useEquipment(id: string) {
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/settings/equipment/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("equipment_load_failed");
        return response.json() as Promise<{ data: EquipmentItem }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setEquipment(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { equipment, hasError, isLoading };
}
