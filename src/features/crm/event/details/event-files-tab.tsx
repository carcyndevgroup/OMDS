"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";

import { useEventFileMutation } from "../../files/hooks/use-event-file-mutation";
import { useEventFiles } from "../../files/hooks/use-event-files";
import type { EventFileFormValues } from "../../files/types/event-file";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";

const initialValues: EventFileFormValues = {
  fileName: "",
  fileUrl: "",
  includeOnRunSheet: true,
  notes: "",
};

export function EventFilesTab({ event, t }: EventDetailSectionProps) {
  const eventFiles = useEventFiles(event.eventId);
  const mutation = useEventFileMutation(event.eventId);
  const [values, setValues] = useState(initialValues);

  const save = async () => {
    if (!values.fileName.trim() || !values.fileUrl.trim()) return;
    await mutation.create(values);
    setValues(initialValues);
    await eventFiles.refresh();
  };

  const remove = async (fileId: string) => {
    await mutation.remove(fileId);
    await eventFiles.refresh();
  };

  return (
    <EventDetailSection title={t("crm.event.files.title")}>
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <CrmTextInput label={t("crm.event.files.field.name")} onChange={(value) => setValues((current) => ({ ...current, fileName: value }))} t={t} value={values.fileName} />
          <CrmTextInput label={t("crm.event.files.field.url")} onChange={(value) => setValues((current) => ({ ...current, fileUrl: value }))} t={t} value={values.fileUrl} />
        </div>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={values.includeOnRunSheet} className="h-4 w-4 accent-cyan-300" onChange={(event) => setValues((current) => ({ ...current, includeOnRunSheet: event.target.checked }))} type="checkbox" />
          {t("crm.event.files.field.includeOnRunSheet")}
        </label>
        <CrmTextarea label={t("crm.event.files.field.notes")} onChange={(value) => setValues((current) => ({ ...current, notes: value }))} placeholder={t("crm.event.files.placeholder.notes")} t={t} value={values.notes} />
        <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={save} type="button">
          {t("crm.event.files.action.add")}
        </button>

        {eventFiles.isLoading ? <p className="text-sm text-zinc-500">{t("crm.event.files.loading")}</p> : null}
        {eventFiles.hasError ? <p className="text-sm text-rose-300">{t("crm.event.files.loadError")}</p> : null}
        {!eventFiles.isLoading && !eventFiles.files.length ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">{t("crm.event.files.empty")}</p>
        ) : null}
        <div className="grid gap-3">
          {eventFiles.files.map((file) => (
            <article className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-4 sm:flex-row sm:items-center sm:justify-between" key={file.id}>
              <div>
                <a className="inline-flex items-center gap-2 font-bold text-cyan-200" href={file.fileUrl} rel="noreferrer" target="_blank">
                  <ExternalLink aria-hidden="true" size={16} />
                  {file.fileName}
                </a>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">
                  {file.includeOnRunSheet ? t("crm.event.files.status.included") : t("crm.event.files.status.notIncluded")}
                </p>
                {file.notes ? <p className="mt-2 text-sm text-zinc-500">{file.notes}</p> : null}
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => remove(file.id)} type="button">
                <Trash2 aria-hidden="true" size={16} />
                {t("crm.event.files.action.remove")}
              </button>
            </article>
          ))}
        </div>
      </div>
    </EventDetailSection>
  );
}
