"use client";

import { useCallback, useState } from "react";

import type { Planner, PlannerFormValues } from "../types/planner";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function usePlannerMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: PlannerFormValues) => {
      setStatus("loading");
      const response = await fetch(id ? `/api/crm/planners/${id}` : "/api/crm/planners", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: id ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("planner_mutation_failed");
      }

      const payload = (await response.json()) as { data: Planner };
      setStatus("success");
      return payload.data;
    },
    [id],
  );

  return { mutate, status };
}
