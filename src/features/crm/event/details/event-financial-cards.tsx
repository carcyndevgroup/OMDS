import type { ReactNode } from "react";

import type { Invoice } from "../../invoice/types/invoice";
import type { Translate } from "../../shared/types/form-types";
import { formatMoneyMxn } from "../../shared/utils/money-format";

const invoiceStatusKeys = {
  draft: "crm.invoice.status.draft",
  issued: "crm.invoice.status.issued",
  paid: "crm.invoice.status.paid",
  payment_promised: "crm.invoice.status.paymentPromised",
  void: "crm.invoice.status.void",
} as const;

const invoiceTypeKeys = {
  omds_client_invoice: "crm.invoice.type.client",
  pv_internal_factura: "crm.invoice.type.pvInternal",
} as const;

export function MetricCard(props: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const { icon, label, value } = props;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex items-center gap-2 text-cyan-200">{icon}</div>
      <p className="mt-4 text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

export function SummaryRow(props: {
  isStrong?: boolean;
  label: string;
  value: string;
}) {
  const { isStrong = false, label, value } = props;
  return (
    <div className={`flex justify-between gap-4 ${isStrong ? "font-black text-cyan-200" : "text-zinc-300"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function InvoiceFinancialCard(props: { invoice: Invoice; t: Translate }) {
  const { invoice, t } = props;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="font-bold text-cyan-200">{t(invoiceTypeKeys[invoice.invoiceType])}</h3>
          <p className="mt-1 text-sm text-zinc-500">{t(invoiceStatusKeys[invoice.status])}</p>
        </div>
        <p className="text-lg font-black text-white">
          {formatMoneyMxn(invoice.totalMxn)}
        </p>
      </div>
      <div className="mt-3 divide-y divide-zinc-800 border-t border-zinc-800">
        {invoice.items.map((item) => (
          <div className="flex justify-between gap-4 py-2 text-sm" key={item.id}>
            <span className="text-zinc-300">{item.description}</span>
            <span className="font-bold text-zinc-100">
              {formatMoneyMxn(item.lineTotalMxn)}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
