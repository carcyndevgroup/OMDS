import {
  ArrowUpRight,
  Archive,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import type { Locale } from "@/core/i18n";

import { ConfirmationDialog } from "../../shared/components/confirmation-dialog";
import { formatPhone } from "../../shared/utils/phone-format";
import type { Translate } from "../../shared/types/form-types";
import { bookingStatusOptions } from "../constants/client-options";
import type { ClientListItem } from "../types/client";
import { clientListGridStyle, type ClientColumnId } from "./client-list-columns";

type ClientListCardProps = {
  client: ClientListItem;
  locale: Locale;
  onArchive: (id: string) => Promise<void>;
  onUnarchive: (id: string) => Promise<void>;
  t: Translate;
  visibleColumns: readonly ClientColumnId[];
};

export function ClientListCard({ client, locale, onArchive, onUnarchive, t, visibleColumns }: ClientListCardProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [archiveError, setArchiveError] = useState(false);
  const event = client.nextEvent;
  const statusKey = bookingStatusOptions.find(
    (option) => option.value === event?.bookingStatus,
  )?.translationKey;
  const eventDate = event
    ? new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
        dateStyle: "medium",
      }).format(new Date(`${event.eventDate}T00:00:00`))
    : null;

  const cells: Record<ClientColumnId, ReactNode> = {
    actions: (
      <div className="relative z-20 flex items-center gap-2 lg:justify-end">
        <Link
          aria-label={`${t("crm.client.list.action.edit")} ${client.firstName} ${client.lastName}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/40 text-cyan-200 transition hover:bg-cyan-300/10"
          href={`/crm/clients/${client.id}/edit`}
        >
          <Pencil aria-hidden="true" size={16} />
        </Link>
        <button
          aria-label={t(client.archivedAt ? "crm.client.list.action.unarchive" : "crm.client.list.action.archive")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-400/30 text-amber-300 transition hover:bg-amber-400/10 disabled:opacity-50"
          disabled={isArchiving}
          onClick={() => { setArchiveError(false); setIsConfirmingArchive(true); }}
          type="button"
        >
          <Archive aria-hidden="true" size={16} />
        </button>
        <ArrowUpRight aria-hidden="true" className="text-zinc-500" size={20} />
      </div>
    ),
    client: (
      <div className="pointer-events-none relative z-10 min-w-0">
        <h2 className="truncate text-base font-bold text-cyan-200">
          {client.firstName} {client.lastName}
        </h2>
        <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-zinc-400">
          <Mail aria-hidden="true" className="shrink-0" size={15} />
          <span className="truncate">{client.email}</span>
        </p>
        {client.companyName ? (
          <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-zinc-500">
            <Building2 aria-hidden="true" className="shrink-0" size={15} />
            <span className="truncate">{client.companyName}</span>
          </p>
        ) : null}
      </div>
    ),
    contact: (
      <div className="pointer-events-none relative z-10 space-y-1 text-sm font-semibold text-zinc-300">
        <span className="flex items-center gap-2">
          <Phone aria-hidden="true" size={15} />
          {formatPhone(client.phone)}
        </span>
        {event ? (
          <span className="flex items-center gap-2 text-zinc-500">
            <CalendarDays aria-hidden="true" size={15} />
            {eventDate}
          </span>
        ) : null}
      </div>
    ),
    event: (
      <div className="pointer-events-none relative z-10 min-w-0 space-y-1 text-sm font-semibold text-zinc-300">
        {event ? (
          <span className="flex items-center gap-2">
            <MapPin aria-hidden="true" size={15} />
            <span className="truncate">{event.venueName}</span>
          </span>
        ) : (
          <span className="text-zinc-500">{t("crm.client.list.noUpcomingEvent")}</span>
        )}
        {statusKey ? (
          <span className="inline-flex rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">
            {t(statusKey)}
          </span>
        ) : null}
      </div>
    ),
  };

  return (
    <article
      className="relative grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-lg shadow-black/10 transition hover:border-cyan-300/60 hover:bg-zinc-900/80 lg:grid-cols-[var(--list-columns)]"
      style={clientListGridStyle(visibleColumns)}
    >
      <Link
        aria-label={`${t("crm.client.list.action.view")} ${client.firstName} ${client.lastName}`}
        className="absolute inset-0 z-0 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        href={`/crm/clients/${client.id}`}
      />
      {visibleColumns.map((column) => <div key={column}>{cells[column]}</div>)}
      <ConfirmationDialog
        confirmKey={client.archivedAt ? "crm.client.list.action.unarchive" : "crm.client.list.action.archive"}
        errorKey={archiveError ? "crm.archive.audit.updateError" : undefined}
        isOpen={isConfirmingArchive}
        isWorking={isArchiving}
        messageKey="crm.client.list.confirmArchiveBody"
        onCancel={() => setIsConfirmingArchive(false)}
        onConfirm={() => {
          setIsArchiving(true);
          void (client.archivedAt ? onUnarchive(client.id) : onArchive(client.id)).catch(() => setArchiveError(true)).finally(() => {
            setIsArchiving(false);
            setIsConfirmingArchive(false);
          });
        }}
        t={t}
        titleKey="crm.client.list.confirmArchiveTitle"
      />
    </article>
  );
}
