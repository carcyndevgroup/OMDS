import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createQuote,
  listEventQuotes,
} from "../repositories/quote-repository";
import { updateQuoteRecipients } from "../repositories/quote-recipient-repository";
import { applyEventServicesToQuoteVersion } from "../repositories/quote-event-services-repository";
import { applyQuoteWorkflowAction } from "../repositories/quote-workflow-repository";
import { updateQuoteVersionSettings } from "../repositories/quote-version-repository";
import {
  addManualItemToQuoteVersion,
  addProductToQuoteVersion,
  moveQuoteItem,
  removeQuoteItem,
  updateQuoteItem,
} from "../repositories/quote-item-repository";
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

export async function createQuoteApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    addManualItem: (versionId: string, values: QuoteAddManualItemValues) =>
      addManualItemToQuoteVersion(client, versionId, values),
    addProduct: (versionId: string, values: QuoteAddProductValues) =>
      addProductToQuoteVersion(client, versionId, values),
    applyEventServices: (eventId: string, versionId: string) =>
      applyEventServicesToQuoteVersion(client, eventId, versionId),
    create: (eventId: string, values: QuoteCreateValues) =>
      createQuote(client, eventId, values),
    list: (eventId: string) => listEventQuotes(client, eventId),
    workflow: (
      eventId: string,
      quoteId: string,
      action: QuoteWorkflowAction,
    ) => applyQuoteWorkflowAction(client, eventId, quoteId, action),
    moveItem: (
      versionId: string,
      itemId: string,
      direction: QuoteMoveDirection,
    ) => moveQuoteItem(client, versionId, itemId, direction),
    removeItem: (versionId: string, itemId: string) =>
      removeQuoteItem(client, versionId, itemId),
    updateItem: (
      versionId: string,
      itemId: string,
      values: QuoteUpdateItemValues,
    ) => updateQuoteItem(client, versionId, itemId, values),
    updateRecipients: (quoteId: string, values: QuoteRecipientValues[]) =>
      updateQuoteRecipients(client, quoteId, values),
    updateVersion: (versionId: string, values: QuoteUpdateVersionValues) =>
      updateQuoteVersionSettings(client, versionId, values),
  };
}
