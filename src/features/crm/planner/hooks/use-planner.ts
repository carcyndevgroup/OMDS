"use client";

import { useEffect, useState } from "react";

import type { Planner } from "../types/planner";

export function usePlanner(id: string) {
  const [planner, setPlanner] = useState<Planner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const response = await fetch(`/api/crm/planners/${id}`);
        if (!response.ok) throw new Error("planner_load_failed");
        const payload = (await response.json()) as { data: Planner };
        if (isActive) setPlanner(payload.data);
      } catch {
        if (isActive) setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isActive = false;
    };
  }, [id]);

  return { hasError, isLoading, planner };
}
