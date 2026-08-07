import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

export function ClientNotesSection({ client, t }: ClientDetailSectionProps) {
  return (
    <ClientDetailSection title={t("crm.client.detail.section.notes")}>
      {client.event ? (
        <dl className="grid gap-x-10 gap-y-7 md:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              {t("crm.event.notes.field.notes")}
            </dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {client.event.notes || t("crm.client.detail.empty.notes")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              {t("public.questionnaire.field.specialRequests")}
            </dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {client.event.specialRequests || t("common.notProvided")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              {t("public.questionnaire.field.operationalNotes")}
            </dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {client.event.clientOperationalNotes || t("common.notProvided")}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      )}
    </ClientDetailSection>
  );
}
