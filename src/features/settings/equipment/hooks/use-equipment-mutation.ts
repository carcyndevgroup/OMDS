"use client";

import { useCallback, useState } from "react";

import type { EquipmentFormValues } from "../types/equipment";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEquipmentMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: EquipmentFormValues) => {
      setStatus("loading");
      const response = await fetch(id ? `/api/settings/equipment/${id}` : "/api/settings/equipment", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: id ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("equipment_mutation_failed");
      }

      setStatus("success");
    },
    [id],
  );

  return { mutate, status };
}
