import { ExternalLink, FileQuestion, FileSignature, ReceiptText, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EventDetailSection } from "./event-detail-section";
import type { EventDetailSectionProps } from "./event-detail-types";

export function EventLinksTab({ event, t }: EventDetailSectionProps) {
  return (
    <EventDetailSection title={t("crm.event.links.title")}>
      <div className="grid gap-4 md:grid-cols-2">
        <LinkCard
          href={`/crm/clients/${event.clientId}`}
          icon={<UserRound aria-hidden="true" size={20} />}
          label={t("crm.event.links.client")}
        />
        <LinkCard
          href={`/crm/clients/${event.clientId}`}
          icon={<ReceiptText aria-hidden="true" size={20} />}
          label={t("crm.event.links.quote")}
        />
        <ComingSoonCard
          icon={<FileQuestion aria-hidden="true" size={20} />}
          label={t("crm.event.links.questionnaire")}
          t={t}
        />
        <ComingSoonCard
          icon={<FileSignature aria-hidden="true" size={20} />}
          label={t("crm.event.links.contract")}
          t={t}
        />
        <ComingSoonCard
          icon={<ReceiptText aria-hidden="true" size={20} />}
          label={t("crm.event.links.invoice")}
          t={t}
        />
      </div>
    </EventDetailSection>
  );
}

function LinkCard(props: { href: string; icon: ReactNode; label: string }) {
  const { href, icon, label } = props;

  return (
    <Link
      className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/50 p-4 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
      href={href}
    >
      <span className="flex items-center gap-3">
        <span className="text-cyan-200">{icon}</span>
        {label}
      </span>
      <ExternalLink aria-hidden="true" size={16} />
    </Link>
  );
}

function ComingSoonCard(props: {
  icon: ReactNode;
  label: string;
  t: EventDetailSectionProps["t"];
}) {
  const { icon, label, t } = props;

  return (
    <div className="flex items-center justify-between rounded-md border border-dashed border-zinc-800 bg-zinc-950/30 p-4 text-sm font-bold text-zinc-500">
      <span className="flex items-center gap-3">
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-xs uppercase tracking-widest">
        {t("common.comingSoon")}
      </span>
    </div>
  );
}
