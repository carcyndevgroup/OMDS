"use client";

import type { Translate } from "@/features/crm/shared/types/form-types";
import type { ProductItem } from "@/features/settings/product";

import type {
  QuoteAddProductValues,
  QuoteMoveDirection,
  QuoteSummary,
  QuoteUpdateItemValues,
} from "../types/quote";
import { QuoteEventServicesButton } from "./quote-event-services-button";
import { QuoteItemRow } from "./quote-item-row";
import { QuoteProductPicker } from "./quote-product-picker";
import { QuoteTotals } from "./quote-totals";
import { QuoteVersionHistory } from "./quote-version-history";
import { statusKeys } from "./quote-status-keys";

type QuoteBuilderProps = {
  canEdit: boolean;
  onAddProduct: (values: QuoteAddProductValues) => Promise<void>;
  onApplyEventServices: () => Promise<void>;
  onMoveItem: (itemId: string, direction: QuoteMoveDirection) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onUpdateItem: (itemId: string, values: QuoteUpdateItemValues) => Promise<void>;
  products: ProductItem[];
  quote: QuoteSummary;
  t: Translate;
};

export function QuoteBuilder(props: QuoteBuilderProps) {
  const {
    canEdit,
    onAddProduct,
    onApplyEventServices,
    onMoveItem,
    onRemoveItem,
    onUpdateItem,
    products,
    quote,
    t,
  } = props;
  const version = quote.currentVersion;

  return (
    <section className="space-y-4">
      <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
        {t("crm.quote.builder.title")}
      </p>
      {version?.items.length ? version.items.map((item, index) => (
        <QuoteItemRow
          canMoveDown={index < version.items.length - 1}
          canMoveUp={index > 0}
          item={item}
          key={item.id}
          onMove={onMoveItem}
          onRemove={onRemoveItem}
          onUpdate={onUpdateItem}
          readOnly={!canEdit}
          t={t}
        />
      )) : (
        <p className="rounded-md border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
          {t("crm.quote.empty.items")}
        </p>
      )}
      {version ? <QuoteTotals t={t} version={version} /> : null}
      {canEdit ? (
        <div className="space-y-4 border-t border-zinc-800 pt-4">
          <QuoteEventServicesButton onApply={onApplyEventServices} t={t} />
          <QuoteProductPicker onAdd={onAddProduct} products={products} t={t} />
        </div>
      ) : null}
      <QuoteVersionHistory statusKeys={statusKeys} t={t} versions={quote.versions} />
    </section>
  );
}
