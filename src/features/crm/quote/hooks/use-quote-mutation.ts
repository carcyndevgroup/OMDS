"use client";

import { useCallback, useState } from "react";

import type {
  QuoteAddManualItemValues,
  QuoteAddProductValues,
  QuoteCreateValues,
  QuoteMoveDirection,
  QuoteRecipientValues,
  QuoteUpdateItemValues,
  QuoteUpdateVersionValues,
  QuoteWorkflowAction,
} from "../types/quote";

type MutationStatus = "idle" | "loading" | "success" | "error";

export function useQuoteMutation(eventId: string) {
  const [status, setStatus] = useState<MutationStatus>("idle");

  const addManualItem = useCallback(async (
    quoteId: string,
    versionId: string,
    values: QuoteAddManualItemValues,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}/manual-items`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_add_manual_item_failed");
    }
    setStatus("success");
  }, [eventId]);

  const addProduct = useCallback(async (
    quoteId: string,
    versionId: string,
    values: QuoteAddProductValues,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}/items`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_add_product_failed");
    }
    setStatus("success");
  }, [eventId]);

  const applyEventServices = useCallback(async (
    quoteId: string,
    versionId: string,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}/event-services`, {
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_apply_event_services_failed");
    }
    setStatus("success");
  }, [eventId]);

  const create = useCallback(async (values: QuoteCreateValues) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_create_failed");
    }
    setStatus("success");
  }, [eventId]);

  const removeItem = useCallback(async (
    quoteId: string,
    versionId: string,
    itemId: string,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}/items/${itemId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_remove_item_failed");
    }
    setStatus("success");
  }, [eventId]);

  const moveItem = useCallback(async (
    quoteId: string,
    versionId: string,
    itemId: string,
    direction: QuoteMoveDirection,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}/items/${itemId}`, {
      body: JSON.stringify({ direction }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_move_item_failed");
    }
    setStatus("success");
  }, [eventId]);

  const updateItem = useCallback(async (
    quoteId: string,
    versionId: string,
    itemId: string,
    values: QuoteUpdateItemValues,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}/items/${itemId}`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_update_item_failed");
    }
    setStatus("success");
  }, [eventId]);

  const updateVersion = useCallback(async (
    quoteId: string,
    versionId: string,
    values: QuoteUpdateVersionValues,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/versions/${versionId}`, {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_update_version_failed");
    }
    setStatus("success");
  }, [eventId]);

  const updateRecipients = useCallback(async (
    quoteId: string,
    values: QuoteRecipientValues[],
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}/recipients`, {
      body: JSON.stringify({ recipients: values }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_update_recipients_failed");
    }
    setStatus("success");
  }, [eventId]);

  const workflow = useCallback(async (
    quoteId: string,
    action: QuoteWorkflowAction,
  ) => {
    setStatus("loading");
    const response = await fetch(`/api/crm/events/${eventId}/quotes/${quoteId}`, {
      body: JSON.stringify({ action }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("quote_workflow_failed");
    }
    setStatus("success");
  }, [eventId]);

  return {
    addManualItem,
    addProduct,
    applyEventServices,
    create,
    moveItem,
    removeItem,
    status,
    updateItem,
    updateRecipients,
    updateVersion,
    workflow,
  };
}
