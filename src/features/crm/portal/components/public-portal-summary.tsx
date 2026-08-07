"use client";

import { useTranslation } from "@/core/i18n";
import type { PublicClientPortalAccess } from "../types/client-portal";

type PublicPortalSummaryProps = {
  portal: PublicClientPortalAccess;
};

export function PublicPortalSummary({ portal }: PublicPortalSummaryProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <PortalSummary
          label={t("crm.client.detail.field.fullName")}
          value={portal.clientName}
        />
        <PortalSummary
          label={t("crm.event.detail.field.eventDate")}
          value={portal.eventDate}
        />
        <PortalSummary
          label={t("crm.event.detail.field.venueName")}
          value={portal.venueName}
        />
      </div>
    </section>
  );
}

function PortalSummary(props: { label: string; value: string }) {
  const { label, value } = props;
  const { t } = useTranslation();

  return (
    <div>
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 font-bold text-zinc-100">
        {value || t("common.notProvided")}
      </p>
    </div>
  );
}
