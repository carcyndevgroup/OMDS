"use client";

import { useEffect, useState } from "react";

import type { StaffMember } from "../types/staff";

export function useStaff(id: string) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setHasError(false);
    setIsLoading(true);

    void fetch(`/api/crm/staff/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("staff_load_failed");
        return response.json() as Promise<{ data: StaffMember }>;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setStaff(payload.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { hasError, isLoading, staff };
}
