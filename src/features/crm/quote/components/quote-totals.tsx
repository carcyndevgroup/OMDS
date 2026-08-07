import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteVersion } from "../types/quote";
import { formatQuoteMoney, getQuoteDiscountAmountMxn } from "../utils/quote-money";

type QuoteTotalsProps = {
  align?: "right" | "stretch";
  t: Translate;
  version: QuoteVersion;
};

export function QuoteTotals({ align = "right", t, version }: QuoteTotalsProps) {
  const discount = getQuoteDiscountAmountMxn(version);

  return (
    <div className={align === "right" ? "ml-auto grid w-full max-w-sm gap-2 text-sm" : "grid gap-2 text-sm"}>
      <Row label={t("crm.quote.total.items")} value={formatQuoteMoney(version.itemsTotalMxn, version)} />
      {discount > 0 ? (
        <Row label={t("crm.quote.total.discount")} value={formatQuoteMoney(discount, version)} />
      ) : null}
      <Row label={t("crm.quote.total.subtotal")} value={formatQuoteMoney(version.subtotalMxn, version)} />
      {version.appliesIvaTax ? (
        <Row label={t("crm.quote.total.ivaTax")} value={formatQuoteMoney(version.ivaTaxMxn, version)} />
      ) : null}
      {version.appliesIvaRetention ? (
        <Row label={t("crm.quote.total.ivaRetention")} value={`-${formatQuoteMoney(version.ivaRetentionMxn, version)}`} />
      ) : null}
      {version.appliesIsrRetention ? (
        <Row label={t("crm.quote.total.isrRetention")} value={`-${formatQuoteMoney(version.isrRetentionMxn, version)}`} />
      ) : null}
      <Row isStrong label={t("crm.quote.total.total")} value={formatQuoteMoney(version.totalMxn, version)} />
    </div>
  );
}

function Row(props: { isStrong?: boolean; label: string; value: string }) {
  const { isStrong = false, label, value } = props;

  return (
    <div className={["flex justify-between gap-6", isStrong ? "text-lg font-black text-cyan-200" : "text-zinc-400"].join(" ")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
