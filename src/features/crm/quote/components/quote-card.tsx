"use client";

import { useState } from "react";

import type { Translate } from "@/features/crm/shared/types/form-types";
import type { ProductItem } from "@/features/settings/product";

import type {
  QuoteAddManualItemValues,
  QuoteAddProductValues,
  QuoteMoveDirection,
  QuoteRecipientValues,
  QuoteSummary,
  QuoteUpdateItemValues,
  QuoteUpdateVersionValues,
  QuoteWorkflowAction,
} from "../types/quote";
import { QuoteActions } from "./quote-actions";
import { QuoteBuilder } from "./quote-builder";
import { QuotePreview } from "./quote-preview";
import { QuoteSettingsDrawer, type QuoteEventContactOption } from "./quote-settings-drawer";
import { statusKeys } from "./quote-status-keys";

type QuoteCardProps = {
  eventId: string;
  eventContacts: QuoteEventContactOption[];
  eventDistanceFromHqKm: number | null;
  bookingType: "direct" | "preferred_vendor";
  eventType: "wedding" | "social_event" | "corporate_event" | "convention" | "other";
  onAddManualItem: (
    quoteId: string,
    versionId: string,
    values: QuoteAddManualItemValues,
  ) => Promise<void>;
  onAddProduct: (
    quoteId: string,
    versionId: string,
    values: QuoteAddProductValues,
  ) => Promise<void>;
  onApplyEventServices: (quoteId: string, versionId: string) => Promise<void>;
  onMoveItem: (
    quoteId: string,
    versionId: string,
    itemId: string,
    direction: QuoteMoveDirection,
  ) => Promise<void>;
  onRemoveItem: (
    quoteId: string,
    versionId: string,
    itemId: string,
  ) => Promise<void>;
  onUpdateItem: (
    quoteId: string,
    versionId: string,
    itemId: string,
    values: QuoteUpdateItemValues,
  ) => Promise<void>;
  onUpdateVersion: (
    quoteId: string,
    versionId: string,
    values: QuoteUpdateVersionValues,
  ) => Promise<void>;
  onUpdateRecipients: (
    quoteId: string,
    values: QuoteRecipientValues[],
  ) => Promise<void>;
  onWorkflow: (quoteId: string, action: QuoteWorkflowAction) => Promise<void>;
  products: ProductItem[];
  quote: QuoteSummary;
  t: Translate;
};

export function QuoteCard(props: QuoteCardProps) {
  const {
    onAddProduct,
    onAddManualItem,
    onApplyEventServices,
    onMoveItem,
    onRemoveItem,
    onUpdateItem,
    onUpdateRecipients,
    onUpdateVersion,
    onWorkflow,
    products,
    quote,
    t,
    eventId,
    eventContacts,
    eventDistanceFromHqKm,
    bookingType,
    eventType,
  } = props;
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const version = quote.currentVersion;
  const canEdit = version?.status === "draft";

  return (
    <article className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-200">{quote.title}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">
            {version
              ? `${t("crm.quote.version")} ${version.versionNumber}`
              : t("crm.quote.noVersion")}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
            {t(statusKeys[quote.status])}
          </span>
          <QuoteActions
            canEdit={canEdit}
            isPreviewVisible={isPreviewVisible}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onTogglePreview={() => setIsPreviewVisible((current) => !current)}
            onWorkflow={(action) => onWorkflow(quote.id, action)}
            printHref={`/quote-print/${eventId}/${quote.id}`}
            quoteStatus={quote.status}
            t={t}
          />
        </div>
      </header>
      <div
        className={
          isPreviewVisible
            ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.72fr)]"
            : "grid gap-5"
        }
      >
        <QuoteBuilder
          canEdit={canEdit}
          onAddProduct={(values) =>
            version ? onAddProduct(quote.id, version.id, values) : Promise.resolve()
          }
          onApplyEventServices={() =>
            version ? onApplyEventServices(quote.id, version.id) : Promise.resolve()
          }
          onMoveItem={(itemId, direction) =>
            version
              ? onMoveItem(quote.id, version.id, itemId, direction)
              : Promise.resolve()
          }
          onRemoveItem={(itemId) =>
            version ? onRemoveItem(quote.id, version.id, itemId) : Promise.resolve()
          }
          onUpdateItem={(itemId, values) =>
            version
              ? onUpdateItem(quote.id, version.id, itemId, values)
              : Promise.resolve()
          }
          products={products}
          quote={quote}
          t={t}
        />
        {isPreviewVisible ? <QuotePreview quote={quote} t={t} version={version} /> : null}
      </div>
      <QuoteSettingsDrawer
        bookingType={bookingType}
        canEdit={canEdit}
        eventContacts={eventContacts}
        eventDistanceFromHqKm={eventDistanceFromHqKm}
        eventType={eventType}
        isOpen={isSettingsOpen}
        onAddManualItem={(values) =>
          version ? onAddManualItem(quote.id, version.id, values) : Promise.resolve()
        }
        onClose={() => setIsSettingsOpen(false)}
        onUpdateRecipients={(values) => onUpdateRecipients(quote.id, values)}
        onUpdateVersion={(values) =>
          version ? onUpdateVersion(quote.id, version.id, values) : Promise.resolve()
        }
        quote={quote}
        t={t}
        version={version}
      />
    </article>
  );
}
