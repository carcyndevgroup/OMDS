"use client";

import { useCallback, useState } from "react";

import type { StaffFormValues } from "../types/staff";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useStaffMutation(id?: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const mutate = useCallback(
    async (values: StaffFormValues) => {
      setStatus("loading");
      const response = await fetch(id ? `/api/crm/staff/${id}` : "/api/crm/staff", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: id ? "PUT" : "POST",
      });

      if (!response.ok) {
        setStatus("error");
        throw new Error("staff_mutation_failed");
      }

      setStatus("success");
    },
    [id],
  );

  return { mutate, status };
}
