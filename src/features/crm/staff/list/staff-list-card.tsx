import { Pencil, Phone } from "lucide-react";
import Link from "next/link";

import type { Translate } from "../../shared/types/form-types";
import { formatPhone } from "../../shared/utils/phone-format";
import type { StaffMember } from "../types/staff";

type StaffListCardProps = {
  staff: StaffMember;
  t: Translate;
};

export function StaffListCard({ staff, t }: StaffListCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{staff.displayName || staff.name}</h2>
            {staff.isDriver ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t("crm.staff.status.driver")}</span> : null}
            {!staff.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("crm.staff.status.inactive")}</span> : null}
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
            <Phone aria-hidden="true" size={15} />
            {formatPhone(staff.phone)}
          </p>
        </div>
        <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/crm/staff/${staff.id}/edit`}>
          <Pencil aria-hidden="true" size={16} />
          {t("crm.staff.action.edit")}
        </Link>
      </div>
    </article>
  );
}
