"use client";

import { useCallback, useState } from "react";

import type { InvoiceAction, InvoiceCreateInput } from "../types/invoice";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useInvoiceMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const create = useCallback(async (input: InvoiceCreateInput) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/invoices`, {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("invoice_create_failed");
    }
    setStatus("success");
  }, [eventId]);

  const workflow = useCallback(async (
    invoiceId: string,
    action: InvoiceAction,
  ) => {
    setStatus("loading");
    const response = await fetch(
      `/api/crm/events/${eventId}/invoices/${invoiceId}`,
      {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      },
    );
    if (!response.ok) {
      setStatus("error");
      throw new Error("invoice_workflow_failed");
    }
    setStatus("success");
  }, [eventId]);

  return { create, status, workflow };
}
