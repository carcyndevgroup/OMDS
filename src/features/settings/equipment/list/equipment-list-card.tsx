import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Translate } from "@/features/crm/shared/types/form-types";

import { equipmentCategoryOptions } from "../constants/equipment-options";
import type { EquipmentItem } from "../types/equipment";

type EquipmentListCardProps = {
  equipment: EquipmentItem;
  t: Translate;
};

export function EquipmentListCard({ equipment, t }: EquipmentListCardProps) {
  const categoryKey = equipmentCategoryOptions.find((option) => {
    return option.value === equipment.category;
  })?.translationKey;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-cyan-200">{equipment.name}</h2>
            {categoryKey ? <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">{t(categoryKey)}</span> : null}
            {!equipment.isActive ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">{t("settings.equipment.status.inactive")}</span> : null}
          </div>
          {equipment.notes ? <p className="mt-3 text-sm text-zinc-500">{equipment.notes}</p> : null}
        </div>
        <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/equipment/${equipment.id}/edit`}>
          <Pencil aria-hidden="true" size={16} />
          {t("settings.equipment.action.edit")}
        </Link>
      </div>
    </article>
  );
}
