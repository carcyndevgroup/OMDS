"use client";

import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useMemo } from "react";

import { useClientPortalAccess } from "../../portal/hooks/use-client-portal-access";
import type { ClientPortalAccess, ClientPortalStep } from "../../portal/types/client-portal";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

const steps: {
  key: ClientPortalStep;
  labelKey: Parameters<ClientDetailSectionProps["t"]>[0];
  read: (access: ClientPortalAccess) => boolean;
}[] = [
  { key: "quotes", labelKey: "crm.portal.step.quotes", read: (access) => access.quotesVisible },
  { key: "questionnaires", labelKey: "crm.portal.step.questionnaires", read: (access) => access.questionnairesVisible },
  { key: "contracts", labelKey: "crm.portal.step.contracts", read: (access) => access.contractsVisible },
  { key: "invoices", labelKey: "crm.portal.step.invoices", read: (access) => access.invoicesVisible },
  { key: "reviews", labelKey: "crm.portal.step.reviews", read: (access) => access.reviewsVisible },
];

export function ClientPortalTab(props: ClientDetailSectionProps) {
  const { client, t } = props;
  const eventId = client.event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.portal")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  return <PortalAccess eventId={eventId} t={t} />;
}

function PortalAccess(props: Pick<ClientDetailSectionProps, "t"> & {
  eventId: string;
}) {
  const { eventId, t } = props;
  const state = useClientPortalAccess(eventId);

  return (
    <ClientDetailSection title={t("crm.portal.title")}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6 text-zinc-500">
            {t("crm.portal.subtitle")}
          </p>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
            onClick={() => void state.sync()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={15} />
            {t("crm.portal.action.sync")}
          </button>
        </div>
        {state.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.portal.loading")}</p>
        ) : null}
        {state.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.portal.loadError")}</p>
        ) : null}
        {state.access ? (
          <>
            <PortalLink accessKey={state.access.accessKey} t={t} />
            <PortalStepList access={state.access} t={t} />
          </>
        ) : null}
      </div>
    </ClientDetailSection>
  );
}

function PortalLink(props: {
  accessKey: string;
  t: ClientDetailSectionProps["t"];
}) {
  const { accessKey, t } = props;
  const path = `/portal/${accessKey}`;
  const href = useMemo(() => {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [path]);

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <p className="text-xs font-bold uppercase text-zinc-500">
        {t("crm.portal.field.portalLink")}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <a
          className="break-all text-sm font-bold text-cyan-200 hover:text-cyan-100"
          href={path}
          rel="noreferrer"
          target="_blank"
        >
          {href}
        </a>
        <button
          className="inline-flex h-9 items-center rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
          onClick={() => void navigator.clipboard.writeText(href)}
          type="button"
        >
          {t("crm.portal.action.copyLink")}
        </button>
      </div>
    </div>
  );
}

function PortalStepList(props: {
  access: ClientPortalAccess;
  t: ClientDetailSectionProps["t"];
}) {
  const { access, t } = props;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {steps.map((step) => {
        const isVisible = step.read(access);
        return (
          <article
            className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4"
            key={step.key}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-zinc-100">{t(step.labelKey)}</h3>
              {isVisible ? (
                <CheckCircle2 className="text-cyan-300" size={18} />
              ) : (
                <XCircle className="text-zinc-600" size={18} />
              )}
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              {isVisible ? t("crm.portal.status.visible") : t("crm.portal.status.locked")}
            </p>
          </article>
        );
      })}
    </div>
  );
}
