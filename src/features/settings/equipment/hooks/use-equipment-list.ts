"use client";

import { useEffect, useState } from "react";

import type { EquipmentItem } from "../types/equipment";

export function useEquipmentList() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch("/api/settings/equipment", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("equipment_list_failed");
        return response.json() as Promise<{ data: EquipmentItem[] }>;
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
  }, []);

  return { equipment, hasError, isLoading };
}
