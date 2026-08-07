import { Pencil } from "lucide-react";

import type { Translate } from "../../shared/types/form-types";
import type { VenueSubLocation } from "../types/venue-sub-location";

type VenueSubLocationCardProps = {
  onEdit: (subLocation: VenueSubLocation) => void;
  subLocation: VenueSubLocation;
  t: Translate;
};

export function VenueSubLocationCard({
  onEdit,
  subLocation,
  t,
}: VenueSubLocationCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-cyan-200">{subLocation.name}</h3>
            {!subLocation.isActive ? (
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">
                {t("crm.venue.subLocation.status.inactive")}
              </span>
            ) : null}
          </div>
          {subLocation.notes ? (
            <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">
              {subLocation.notes}
            </p>
          ) : null}
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200"
          onClick={() => onEdit(subLocation)}
          type="button"
        >
          <Pencil aria-hidden="true" size={16} />
          {t("crm.venue.action.edit")}
        </button>
      </div>
    </article>
  );
}
