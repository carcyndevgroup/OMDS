"use client";

import { useProductList } from "@/features/settings/product/hooks/use-product-list";
import type { BookingType } from "@/features/crm/client/types/client";
import type { EventType } from "@/features/crm/shared/types/crm-options";

import { useEventQuotes } from "../hooks/use-event-quotes";
import { useQuoteMutation } from "../hooks/use-quote-mutation";
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
import type { Translate } from "../../shared/types/form-types";
import type { QuoteEventContactOption } from "./quote-settings-drawer";
import { QuoteCard } from "./quote-card";
import { QuoteCreateCard } from "./quote-create-card";

type QuoteManagerProps = {
  bookingType: BookingType;
  eventId: string;
  eventContacts?: QuoteEventContactOption[];
  eventDistanceFromHqKm?: number | null;
  eventType: EventType;
  t: Translate;
};

export function QuoteManager({
  bookingType,
  eventContacts = [],
  eventDistanceFromHqKm = null,
  eventId,
  eventType,
  t,
}: QuoteManagerProps) {
  const productState = useProductList();
  const quoteState = useEventQuotes(eventId);
  const mutation = useQuoteMutation(eventId);

  const create = async (values: QuoteCreateValues) => {
    await mutation.create(values);
    await quoteState.refresh();
  };

  const addProduct = async (
    quoteId: string,
    versionId: string,
    values: QuoteAddProductValues,
  ) => {
    await mutation.addProduct(quoteId, versionId, values);
    await quoteState.refresh();
  };

  const addManualItem = async (
    quoteId: string,
    versionId: string,
    values: QuoteAddManualItemValues,
  ) => {
    await mutation.addManualItem(quoteId, versionId, values);
    await quoteState.refresh();
  };

  const applyEventServices = async (quoteId: string, versionId: string) => {
    await mutation.applyEventServices(quoteId, versionId);
    await quoteState.refresh();
  };

  const removeItem = async (
    quoteId: string,
    versionId: string,
    itemId: string,
  ) => {
    await mutation.removeItem(quoteId, versionId, itemId);
    await quoteState.refresh();
  };

  const moveItem = async (
    quoteId: string,
    versionId: string,
    itemId: string,
    direction: QuoteMoveDirection,
  ) => {
    await mutation.moveItem(quoteId, versionId, itemId, direction);
    await quoteState.refresh();
  };

  const updateItem = async (
    quoteId: string,
    versionId: string,
    itemId: string,
    values: QuoteUpdateItemValues,
  ) => {
    await mutation.updateItem(quoteId, versionId, itemId, values);
    await quoteState.refresh();
  };

  const updateVersion = async (
    quoteId: string,
    versionId: string,
    values: QuoteUpdateVersionValues,
  ) => {
    await mutation.updateVersion(quoteId, versionId, values);
    await quoteState.refresh();
  };

  const updateRecipients = async (
    quoteId: string,
    values: QuoteRecipientValues[],
  ) => {
    await mutation.updateRecipients(quoteId, values);
    await quoteState.refresh();
  };

  const workflow = async (quoteId: string, action: QuoteWorkflowAction) => {
    await mutation.workflow(quoteId, action);
    await quoteState.refresh();
  };

  return (
    <div className="space-y-5">
      <QuoteCreateCard onCreate={create} t={t} />
      {quoteState.isLoading || productState.isLoading ? (
        <p className="text-sm text-zinc-500">{t("crm.quote.loading")}</p>
      ) : null}
      {quoteState.hasError || productState.hasError ? (
        <p className="text-sm text-rose-300">{t("crm.quote.loadError")}</p>
      ) : null}
      {!quoteState.isLoading && !quoteState.quotes.length ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          {t("crm.quote.empty.quotes")}
        </p>
      ) : null}
      <div className="space-y-4">
        {quoteState.quotes.map((quote) => (
          <QuoteCard
            bookingType={bookingType}
            eventContacts={eventContacts}
            eventDistanceFromHqKm={eventDistanceFromHqKm}
            eventId={eventId}
            eventType={eventType}
            key={quote.id}
            onAddManualItem={addManualItem}
            onAddProduct={addProduct}
            onApplyEventServices={applyEventServices}
            onMoveItem={moveItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            onUpdateRecipients={updateRecipients}
            onUpdateVersion={updateVersion}
            onWorkflow={workflow}
            products={productState.products}
            quote={quote}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
