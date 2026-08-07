"use client";

import { useCallback, useState } from "react";

import type { EventExpenseFormValues } from "../types/event-expense";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useEventExpenseMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const save = useCallback(async (
    values: EventExpenseFormValues,
    expenseId?: string,
  ) => {
    setStatus("loading");
    const url = expenseId
      ? `/api/crm/events/${eventId}/expenses/${expenseId}`
      : `/api/crm/events/${eventId}/expenses`;
    const response = await fetch(url, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: expenseId ? "PATCH" : "POST",
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_expense_save_failed");
    }

    setStatus("success");
  }, [eventId]);

  const remove = useCallback(async (expenseId: string) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/expenses/${expenseId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setStatus("error");
      throw new Error("event_expense_remove_failed");
    }

    setStatus("success");
  }, [eventId]);

  return { remove, save, status };
}
