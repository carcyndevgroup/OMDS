import { Mail, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { eventPlannerRoleOptions } from "../../planner/constants/event-planner-options";
import type { EventPlanner } from "../../planner/types/event-planner";
import type { Translate } from "../../shared/types/form-types";

type EventPlannerCardProps = {
  eventPlanner: EventPlanner;
  onEdit: (eventPlanner: EventPlanner) => void;
  onRemove: (eventPlanner: EventPlanner) => void;
  t: Translate;
};

export function EventPlannerCard({
  eventPlanner,
  onEdit,
  onRemove,
  t,
}: EventPlannerCardProps) {
  const roleKey = eventPlannerRoleOptions.find((option) => {
    return option.value === eventPlanner.role;
  })?.translationKey;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link className="text-base font-bold text-cyan-200" href={`/crm/planners/${eventPlanner.plannerId}`}>
            {eventPlanner.plannerName || t("common.notProvided")}
          </Link>
          {eventPlanner.plannerCompanyName ? (
            <p className="mt-1 text-sm font-semibold text-zinc-400">
              {eventPlanner.plannerCompanyName}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">
            <span>{roleKey ? t(roleKey) : t("common.notProvided")}</span>
            <span>{eventPlanner.commissionEligible ? t("crm.client.planner.status.commissionEligible") : t("crm.client.planner.status.noCommission")}</span>
            {eventPlanner.commissionPercentageOverride ? (
              <span>{eventPlanner.commissionPercentageOverride}%</span>
            ) : null}
            {eventPlanner.email ? (
              <span className="inline-flex items-center gap-2">
                <Mail aria-hidden="true" size={15} />
                {eventPlanner.email}
              </span>
            ) : null}
          </div>
          {eventPlanner.notes ? (
            <p className="mt-4 text-sm leading-6 text-zinc-400">{eventPlanner.notes}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => onEdit(eventPlanner)} type="button">
            <Pencil aria-hidden="true" size={15} />
            {t("crm.client.planner.action.edit")}
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-400/40 px-3 text-sm font-bold text-rose-200" onClick={() => onRemove(eventPlanner)} type="button">
            <Trash2 aria-hidden="true" size={15} />
            {t("crm.client.planner.action.remove")}
          </button>
        </div>
      </div>
    </article>
  );
}
