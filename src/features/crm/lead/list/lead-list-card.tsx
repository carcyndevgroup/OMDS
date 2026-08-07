import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Mail,
  Pencil,
  Trash2,
  Archive,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/core/i18n";

import { ConfirmationDialog } from "../../shared/components/confirmation-dialog";
import type { Translate } from "../components/lead-form-types";
import {
  eventTypeOptions,
  leadStatusOptions,
} from "../constants/lead-options";
import type { Lead } from "../types/lead";
import { leadListGridStyle, type LeadColumnId } from "./lead-list-columns";

type LeadListCardProps = {
  lead: Lead;
  locale: Locale;
  onDelete: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onUnarchive: (id: string) => Promise<void>;
  t: Translate;
  visibleColumns: readonly LeadColumnId[];
};

const findLabelKey = (
  options: { translationKey: Parameters<Translate>[0]; value: string }[],
  value: string,
) => {
  return options.find((option) => option.value === value)?.translationKey;
};

export function LeadListCard({
  lead,
  locale,
  onDelete,
  onArchive,
  onUnarchive,
  t,
  visibleColumns,
}: LeadListCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [archiveError, setArchiveError] = useState(false);
  const eventTypeKey = findLabelKey(eventTypeOptions, lead.eventType);
  const statusKey = findLabelKey(leadStatusOptions, lead.status);
  const eventDate = new Intl.DateTimeFormat(
    locale === "es" ? "es-MX" : "en-US",
    { dateStyle: "medium" },
  ).format(new Date(`${lead.eventDate}T00:00:00`));

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(lead.id);
      setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await onArchive(lead.id);
      setIsConfirmingArchive(false);
      setArchiveError(false);
    } catch {
      setArchiveError(true);
    } finally {
      setIsArchiving(false);
    }
  };

  const cells: Record<LeadColumnId, ReactNode> = {
    actions: (
      <div className="relative z-20 flex items-center gap-2 lg:justify-end">
        <Link
          aria-label={`${t("crm.lead.list.action.edit")} ${lead.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/40 text-cyan-200 transition hover:bg-cyan-300/10"
          href={`/crm/leads/${lead.id}/edit`}
        >
          <Pencil aria-hidden="true" size={16} />
        </Link>
        <button
          aria-label={t(lead.archivedAt ? "crm.lead.list.action.unarchive" : "crm.lead.list.action.archive")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-400/30 text-amber-300 transition hover:bg-amber-400/10 disabled:opacity-50"
          disabled={isArchiving}
          onClick={() => { setArchiveError(false); setIsConfirmingArchive(true); }}
          type="button"
        >
          <Archive aria-hidden="true" size={16} />
        </button>
        <button
          aria-label={`${t("crm.lead.list.action.delete")} ${lead.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-400/30 text-rose-300 transition hover:bg-rose-400/10"
          onClick={() => setIsConfirmingDelete(true)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={16} />
        </button>
        <ArrowUpRight aria-hidden="true" className="text-zinc-500" size={20} />
      </div>
    ),
    date: (
      <div className="pointer-events-none relative z-10 space-y-1 text-sm font-semibold text-zinc-300">
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" size={15} />
          {eventDate}
        </span>
        <span className="flex items-center gap-2 text-zinc-500">
          <UsersRound aria-hidden="true" size={15} />
          {lead.guestCount} {t("crm.lead.list.guests")}
        </span>
      </div>
    ),
    event: (
      <div className="pointer-events-none relative z-10 flex flex-wrap items-center gap-2">
        {eventTypeKey ? (
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            {t(eventTypeKey)}
          </span>
        ) : null}
        {statusKey ? (
          <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">
            {t(statusKey)}
          </span>
        ) : null}
      </div>
    ),
    lead: (
      <div className="pointer-events-none relative z-10 min-w-0">
        <h2 className="truncate text-base font-bold text-cyan-200">{lead.name}</h2>
        <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-zinc-400">
          <Mail aria-hidden="true" className="shrink-0" size={15} />
          <span className="truncate">{lead.email}</span>
        </p>
      </div>
    ),
  };

  return (
    <article
      className="relative grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-lg shadow-black/10 transition hover:border-cyan-300/60 hover:bg-zinc-900/80 lg:grid-cols-[var(--list-columns)]"
      style={leadListGridStyle(visibleColumns)}
    >
      <Link
        aria-label={`${t("crm.lead.list.action.view")} ${lead.name}`}
        className="absolute inset-0 z-0 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        href={`/crm/leads/${lead.id}`}
      />

      {visibleColumns.map((column) => <div key={column}>{cells[column]}</div>)}
      <ConfirmationDialog
        confirmKey="crm.lead.list.action.delete"
        isOpen={isConfirmingDelete}
        isWorking={isDeleting}
        messageKey="crm.lead.list.confirmDeleteBody"
        onCancel={() => setIsConfirmingDelete(false)}
        onConfirm={() => void handleDelete()}
        t={t}
        titleKey="crm.lead.list.confirmDeleteTitle"
      />
      <ConfirmationDialog
        confirmKey={lead.archivedAt ? "crm.lead.list.action.unarchive" : "crm.lead.list.action.archive"}
        errorKey={archiveError ? "crm.archive.audit.updateError" : undefined}
        isOpen={isConfirmingArchive}
        isWorking={isArchiving}
        messageKey="crm.lead.list.confirmArchiveBody"
        onCancel={() => setIsConfirmingArchive(false)}
        onConfirm={() => {
          setIsArchiving(true);
          void (lead.archivedAt ? onUnarchive(lead.id) : handleArchive()).catch(() => setArchiveError(true)).finally(() => setIsArchiving(false));
        }}
        t={t}
        titleKey="crm.lead.list.confirmArchiveTitle"
      />
    </article>
  );
}
