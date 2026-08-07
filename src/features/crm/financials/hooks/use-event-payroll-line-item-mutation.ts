"use client";

import { useCallback, useState } from "react";

import type { EventPayrollLineItemFormValues } from "../types/event-payroll-line-item";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventPayrollLineItemMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const approve = useCallback(async (lineItemId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/payroll-line-items/${lineItemId}`,
      { method: "PATCH" },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_payroll_line_item_approve_failed");
    }

    setStatus("success");
  }, [eventId]);

  const save = useCallback(async (values: EventPayrollLineItemFormValues, lineItemId?: string) => {
    setStatus("loading");
    const response = await fetch(
      lineItemId
        ? `/api/crm/events/${eventId}/payroll-line-items/${lineItemId}`
        : `/api/crm/events/${eventId}/payroll-line-items`,
      {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: lineItemId ? "PUT" : "POST",
      },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_payroll_line_item_save_failed");
    }

    setStatus("success");
  }, [eventId]);

  const remove = useCallback(async (lineItemId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/payroll-line-items/${lineItemId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_payroll_line_item_remove_failed");
    }

    setStatus("success");
  }, [eventId]);

  return { approve, remove, save, status };
}
