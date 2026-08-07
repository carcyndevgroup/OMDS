"use client";

import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { CrmTextarea } from "../../shared/components/crm-textarea";
import { useEventNotesMutation } from "../hooks/use-event-notes-mutation";
import type { EventDetailSectionProps } from "./event-detail-types";

export function EventNotesTab({ event, t }: EventDetailSectionProps) {
  const [values, setValues] = useState({
    internalIssueNotes: event.internalIssueNotes,
    notes: event.notes,
    operationsNotes: event.operationsNotes,
  });
  const mutation = useEventNotesMutation(event.eventId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutation.mutate(values);
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5" onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">
          {t("crm.event.detail.section.notes")}
        </h2>
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" type="submit">
          <Save aria-hidden="true" size={16} />
          {t("crm.event.notes.action.save")}
        </button>
      </div>

      <div className="space-y-5">
        <CrmTextarea label={t("crm.event.notes.field.notes")} onChange={(value) => setValues((current) => ({ ...current, notes: value }))} placeholder={t("crm.event.notes.placeholder.notes")} t={t} value={values.notes} />
        <CrmTextarea label={t("crm.event.notes.field.operationsNotes")} onChange={(value) => setValues((current) => ({ ...current, operationsNotes: value }))} placeholder={t("crm.event.notes.placeholder.operationsNotes")} t={t} value={values.operationsNotes} />
        <CrmTextarea label={t("crm.event.notes.field.internalIssueNotes")} onChange={(value) => setValues((current) => ({ ...current, internalIssueNotes: value }))} placeholder={t("crm.event.notes.placeholder.internalIssueNotes")} t={t} value={values.internalIssueNotes} />
      </div>

      <p aria-live="polite" className="text-sm font-medium text-zinc-400">
        {mutation.status === "success" ? t("crm.event.notes.saved") : null}
        {mutation.status === "error" ? t("crm.event.notes.error") : null}
      </p>
    </form>
  );
}
