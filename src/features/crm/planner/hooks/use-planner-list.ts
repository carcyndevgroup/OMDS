"use client";

import { useEffect, useState } from "react";

import type { Planner } from "../types/planner";

export function usePlannerList() {
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const response = await fetch("/api/crm/planners");
        if (!response.ok) throw new Error("planner_list_failed");
        const payload = (await response.json()) as { data: Planner[] };
        if (isActive) setPlanners(payload.data);
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
  }, []);

  return { hasError, isLoading, planners };
}
