import { ArrowUpRight, Building2, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Translate } from "../../shared/types/form-types";
import type { Venue } from "../types/venue";
import { venueListGridStyle, type VenueColumnId } from "./venue-list-columns";

type VenueListCardProps = {
  t: Translate;
  venue: Venue;
  visibleColumns: readonly VenueColumnId[];
};

function formatArea(area: string) {
  return area
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function VenueListCard({ t, venue, visibleColumns }: VenueListCardProps) {
  const formattedArea = venue.area ? formatArea(venue.area) : "";
  const relationship = (
    <span
      className={
        venue.isPreferredVendor
          ? "inline-flex rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200"
          : "inline-flex rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400"
      }
    >
      {t(
        venue.isPreferredVendor
          ? "crm.venue.status.preferred"
          : "crm.venue.status.nonPreferred",
      )}
    </span>
  );
  const cells: Record<VenueColumnId, ReactNode> = {
    actions: (
      <div className="relative z-20 flex items-center gap-2 lg:justify-end">
        <Link
          aria-label={`${t("crm.venue.action.edit")} ${venue.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/40 text-cyan-200 transition hover:bg-cyan-300/10"
          href={`/crm/venues/${venue.id}/edit`}
        >
          <Pencil aria-hidden="true" size={16} />
        </Link>
        <ArrowUpRight aria-hidden="true" className="text-zinc-500" size={20} />
      </div>
    ),
    relationship: (
      <div className="pointer-events-none relative z-10 flex items-center">
        {relationship}
      </div>
    ),
    venue: (
      <div className="pointer-events-none relative z-10 flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-200">
          <Building2 aria-hidden="true" size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-cyan-200">
            {venue.name}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <MapPin aria-hidden="true" size={15} />
            {formattedArea || t("common.notProvided")}
          </p>
        </div>
      </div>
    ),
  };

  return (
    <article
      className="relative grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-lg shadow-black/10 transition hover:border-cyan-300/60 hover:bg-zinc-900/80 lg:grid-cols-[var(--list-columns)]"
      style={venueListGridStyle(visibleColumns)}
    >
      <Link
        aria-label={`${t("crm.venue.action.view")} ${venue.name}`}
        className="absolute inset-0 z-0 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        href={`/crm/venues/${venue.id}`}
      />
      {visibleColumns.map((column) => <div key={column}>{cells[column]}</div>)}
    </article>
  );
}
