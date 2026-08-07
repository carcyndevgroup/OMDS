import { ArrowUpRight, Mail, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Translate } from "../../shared/types/form-types";
import { formatPhone } from "../../shared/utils/phone-format";
import type { Planner } from "../types/planner";
import { plannerListGridStyle, type PlannerColumnId } from "./planner-list-columns";

type PlannerListCardProps = {
  planner: Planner;
  t: Translate;
  visibleColumns: readonly PlannerColumnId[];
};

export function PlannerListCard({ planner, t, visibleColumns }: PlannerListCardProps) {
  const cells: Record<PlannerColumnId, ReactNode> = {
    actions: (
      <div className="relative z-20 flex items-center gap-2 lg:justify-end">
        <Link
          aria-label={`${t("crm.planner.action.edit")} ${planner.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/40 text-cyan-200 transition hover:bg-cyan-300/10"
          href={`/crm/planners/${planner.id}/edit`}
        >
          <Pencil aria-hidden="true" size={16} />
        </Link>
        <ArrowUpRight aria-hidden="true" className="text-zinc-500" size={20} />
      </div>
    ),
    contact: (
      <div className="pointer-events-none relative z-10 space-y-1 text-sm font-semibold text-zinc-400">
        <span className="flex min-w-0 items-center gap-2">
          <Mail aria-hidden="true" className="shrink-0" size={15} />
          <span className="truncate">{planner.email || t("common.notProvided")}</span>
        </span>
        <span className="flex items-center gap-2">
          <Phone aria-hidden="true" size={15} />
          {planner.phone ? formatPhone(planner.phone) : t("common.notProvided")}
        </span>
      </div>
    ),
    planner: (
      <div className="pointer-events-none relative z-10 min-w-0">
        <h2 className="truncate text-base font-bold text-cyan-200">{planner.name}</h2>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-400">
          {planner.companyName || t("common.notProvided")}
        </p>
      </div>
    ),
  };

  return (
    <article
      className="relative grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-lg shadow-black/10 transition hover:border-cyan-300/60 hover:bg-zinc-900/80 lg:grid-cols-[var(--list-columns)]"
      style={plannerListGridStyle(visibleColumns)}
    >
      <Link
        aria-label={`${t("crm.planner.action.view")} ${planner.name}`}
        className="absolute inset-0 z-0 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        href={`/crm/planners/${planner.id}`}
      />
      {visibleColumns.map((column) => <div key={column}>{cells[column]}</div>)}
    </article>
  );
}
