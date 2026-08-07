import { ArrowLeft, Pencil, UserRoundPlus } from "lucide-react";
import Link from "next/link";

import type { Translate } from "../components/lead-form-types";
import { leadStatusOptions } from "../constants/lead-options";
import type { Lead } from "../types/lead";

type LeadDetailHeaderProps = {
  lead: Lead;
  t: Translate;
};

export function LeadDetailHeader({ lead, t }: LeadDetailHeaderProps) {
  const canConvert = ["new", "contacted", "waiting_on_lead"].includes(
    lead.status,
  );
  const status = leadStatusOptions.find((option) => {
    return option.value === lead.status;
  });

  return (
    <header className="flex flex-col gap-5 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          aria-label={t("crm.lead.action.back")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          href="/crm/leads"
        >
          <ArrowLeft aria-hidden="true" size={21} />
        </Link>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="truncate text-3xl font-bold text-white">
            {lead.name}
          </h1>
          {status ? (
            <span className="rounded bg-cyan-300/15 px-2.5 py-1 text-xs font-bold text-cyan-200">
              {t(status.translationKey)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 sm:justify-end">
        {canConvert ? (
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md border border-emerald-400/40 px-4 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/10"
            href={`/crm/leads/${lead.id}/convert`}
          >
            <UserRoundPlus aria-hidden="true" size={17} />
            {t("crm.lead.detail.action.convert")}
          </Link>
        ) : null}
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
          href={`/crm/leads/${lead.id}/edit`}
        >
          <Pencil aria-hidden="true" size={17} />
          {t("crm.lead.detail.action.edit")}
        </Link>
      </div>
    </header>
  );
}
