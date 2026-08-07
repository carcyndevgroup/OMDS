import type { Locale } from "@/core/i18n";
import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteSummary, QuoteVersion } from "../types/quote";
import { formatQuoteMoney } from "../utils/quote-money";
import { statusKeys } from "./quote-status-keys";

type QuotePrintDocumentProps = {
  locale: Locale;
  quote: QuoteSummary;
  t: Translate;
  version: QuoteVersion;
};

export function QuotePrintDocument(props: QuotePrintDocumentProps) {
  const { locale, quote, t, version } = props;
  const recipient = quote.recipients[0] ?? null;
  const expiresAt = version.expiresAt
    ? new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
        dateStyle: "medium",
      }).format(new Date(`${version.expiresAt}T00:00:00`))
    : t("crm.quote.print.notProvided");
  const paymentPlanSummary = version.paymentPlanId
    ? `${t("crm.quote.settings.payment.select")}: ${t("crm.quote.settings.payment.saved")}`
    : t("crm.quote.settings.payment.none");

  return (
    <article className="mx-auto max-w-5xl bg-white px-8 py-10 text-zinc-950 print:max-w-none print:px-0 print:py-0">
      <header className="rounded-2xl bg-white px-8 py-10 shadow-[0_1px_0_rgba(15,23,42,0.04)] print:rounded-none print:px-0 print:py-0 print:shadow-none">
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-5xl font-black tracking-[0.18em] text-slate-950 print:text-[4rem]">
              {t("crm.quote.preview.documentTitle")}
            </p>
            <img
              alt={t("brand.shortName")}
              className="mt-4 h-12 w-auto object-contain"
              src="/branding/ohmydesserts-logo-color.png"
            />
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              {t("crm.quote.print.subtitle")}
            </p>
          </div>
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#ebb8a8] bg-[#f2e2d4] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.7)] print:h-28 print:w-28">
            <img
              alt={t("brand.shortName")}
              className="h-[72%] w-[72%] object-contain"
              src="/branding/ohmydesserts-logo-color.png"
            />
          </div>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)]">
          <div className="space-y-6">
            <DetailBlock title={t("crm.quote.settings.client")}>
              <p className="text-lg font-black text-slate-950">{recipient?.name ?? quote.title}</p>
              {recipient?.email ? <p className="mt-1 text-sm text-slate-500">{recipient.email}</p> : null}
            </DetailBlock>
            <DetailBlock title={t("crm.quote.preview.items")}>
              <p className="text-lg font-black text-slate-950">{quote.title}</p>
              <p className="mt-1 text-sm text-slate-500">{paymentPlanSummary}</p>
            </DetailBlock>
          </div>
          <div className="space-y-0 rounded-2xl border border-slate-200 bg-white">
            <MetaRow label={t("crm.quote.version")} value={`${t("crm.quote.version")} ${version.versionNumber}`} />
            <MetaRow label={t("crm.quote.field.expiresAt")} value={expiresAt} />
            <MetaRow label={t("crm.commission.field.status")} value={t(statusKeys[quote.status])} />
            <MetaRow label={t("crm.quote.settings.payment.select")} value={version.paymentPlanId ? t("crm.quote.settings.payment.saved") : t("crm.quote.settings.payment.none")} />
          </div>
        </div>
      </header>
      <section className="px-8 py-8 print:px-0">
        <h2 className="mb-4 text-base font-black uppercase tracking-[0.18em] text-slate-700">
          {t("crm.quote.preview.items")}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1fr_5rem_8rem] bg-[#f5efe8] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700">
            <span>{t("crm.quote.field.description")}</span>
            <span className="text-right">{t("crm.quote.field.quantity")}</span>
            <span className="text-right">{t("crm.quote.preview.amount")}</span>
          </div>
          {version.items.map((item) => (
            <div className="grid grid-cols-[1fr_5rem_8rem] gap-4 border-t border-slate-100 px-4 py-4 text-sm" key={item.id}>
              <div>
                <p className="font-black">{item.description}</p>
                {item.details ? <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">{item.details}</p> : null}
              </div>
              <p className="text-right font-bold">{item.quantity}</p>
              <p className="text-right font-black">{formatQuoteMoney(item.lineTotalMxn, version)}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="ml-auto w-full max-w-md space-y-3 border-t border-slate-200 px-8 pt-6 print:px-0">
        <TotalRow label={t("crm.quote.total.items")} value={formatQuoteMoney(version.itemsTotalMxn, version)} />
        <TotalRow label={t("crm.quote.total.discount")} value={formatQuoteMoney(getDiscount(version), version)} />
        <TotalRow label={t("crm.quote.total.subtotal")} value={formatQuoteMoney(version.subtotalMxn, version)} />
        {version.appliesIvaTax ? (
          <TotalRow label={t("crm.quote.total.ivaTax")} value={formatQuoteMoney(version.ivaTaxMxn, version)} />
        ) : null}
        {version.appliesIvaRetention ? (
          <TotalRow label={t("crm.quote.total.ivaRetention")} value={`-${formatQuoteMoney(version.ivaRetentionMxn, version)}`} />
        ) : null}
        {version.appliesIsrRetention ? (
          <TotalRow label={t("crm.quote.total.isrRetention")} value={`-${formatQuoteMoney(version.isrRetentionMxn, version)}`} />
        ) : null}
        <div className="flex items-center justify-between pt-3 text-2xl font-black text-cyan-700">
          <span>{t("crm.quote.total.total")}</span>
          <span>{formatQuoteMoney(version.totalMxn, version)}</span>
        </div>
      </footer>
    </article>
  );
}

function getDiscount(version: QuoteVersion) {
  return Math.max(Number(version.itemsTotalMxn) - Number(version.subtotalMxn), 0);
}

function TotalRow(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
      <span>{props.label}</span>
      <span>{props.value}</span>
    </div>
  );
}

function DetailBlock(props: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">{props.title}</p>
      <div className="mt-4 border-l-2 border-[#ebb8a8] pl-5">{props.children}</div>
    </section>
  );
}

function MetaRow(props: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center border-b border-slate-200 px-5 py-4 last:border-b-0">
      <span className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">{props.label}</span>
      <span className="text-right text-sm font-black text-slate-950">{props.value}</span>
    </div>
  );
}
