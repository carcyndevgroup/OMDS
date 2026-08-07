import { Check, Pencil, Trash2 } from "lucide-react";

import type { Translate } from "../../shared/types/form-types";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import type { EventPayrollLineItem } from "../types/event-payroll-line-item";

type EventPayrollLineItemCardProps = {
  item: EventPayrollLineItem;
  onApprove: (lineItemId: string) => void;
  onEdit: (item: EventPayrollLineItem) => void;
  onRemove: (lineItemId: string) => void;
  t: Translate;
};

const statusKeys = {
  approved: "crm.payroll.status.approved",
  estimated: "crm.payroll.status.estimated",
  paid: "crm.payroll.status.paid",
  scheduled: "crm.payroll.status.scheduled",
  waived: "crm.payroll.status.waived",
} as const;

const sourceKeys = {
  auto_staffing: "crm.payroll.source.autoStaffing",
  manual: "crm.payroll.source.manual",
} as const;

export function EventPayrollLineItemCard({
  item,
  onApprove,
  onEdit,
  onRemove,
  t,
}: EventPayrollLineItemCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="font-bold text-cyan-200">{item.staffName}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">
            {item.taskName} · {t(statusKeys[item.status])}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">{formatMoneyMxn(item.totalMxn)}</p>
          <span className="mt-1 inline-flex rounded bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-200">
            {t(sourceKeys[item.source])}
          </span>
        </div>
      </div>
      {item.notes ? <p className="mt-2 text-sm text-zinc-400">{item.notes}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {item.status === "estimated" ? (
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/60 px-3 text-sm font-bold text-cyan-200" onClick={() => onApprove(item.id)} type="button">
            <Check aria-hidden="true" size={16} />
            {t("crm.payroll.action.approve")}
          </button>
        ) : null}
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => onEdit(item)} type="button">
          <Pencil aria-hidden="true" size={16} />
          {t("crm.commission.action.edit")}
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-400/40 px-3 text-sm font-bold text-rose-200" onClick={() => onRemove(item.id)} type="button">
          <Trash2 aria-hidden="true" size={16} />
          {t("crm.payroll.action.remove")}
        </button>
      </div>
    </article>
  );
}
