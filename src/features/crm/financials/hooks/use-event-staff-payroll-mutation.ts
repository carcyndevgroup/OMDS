"use client";

import { useCallback, useState } from "react";

import type { EventStaffPayrollFormValues } from "../types/event-staff-payroll";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventStaffPayrollMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const upsert = useCallback(async (values: EventStaffPayrollFormValues) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/payroll`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_staff_payroll_save_failed");
    }

    setStatus("success");
  }, [eventId]);

  const remove = useCallback(async (payrollId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/payroll/${payrollId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_staff_payroll_remove_failed");
    }

    setStatus("success");
  }, [eventId]);

  return { remove, status, upsert };
}
