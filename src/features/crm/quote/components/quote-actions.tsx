import { Check, Eye, EyeOff, Printer, RefreshCw, Send, Settings, XCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteStatus, QuoteWorkflowAction } from "../types/quote";

type QuoteActionsProps = {
  canEdit: boolean;
  isPreviewVisible: boolean;
  onOpenSettings: () => void;
  onTogglePreview: () => void;
  onWorkflow: (action: QuoteWorkflowAction) => Promise<void>;
  printHref: string;
  quoteStatus: QuoteStatus;
  t: Translate;
};

export function QuoteActions(props: QuoteActionsProps) {
  const {
    canEdit,
    isPreviewVisible,
    onOpenSettings,
    onTogglePreview,
    onWorkflow,
    printHref,
    quoteStatus,
    t,
  } = props;
  const isAccepted = quoteStatus === "accepted";

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canEdit ? (
        <ActionButton label={t("crm.quote.action.settings")} onClick={onOpenSettings}>
          <Settings aria-hidden="true" size={16} />
        </ActionButton>
      ) : null}
      <ActionButton
        label={t(isPreviewVisible ? "crm.quote.action.hidePreview" : "crm.quote.action.showPreview")}
        onClick={onTogglePreview}
      >
        {isPreviewVisible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
      </ActionButton>
      <Link
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
        href={printHref}
        target="_blank"
      >
        <Printer aria-hidden="true" size={16} />
        {t("crm.quote.action.print")}
      </Link>
      {canEdit ? (
        <ActionButton label={t("crm.quote.action.send")} onClick={() => onWorkflow("send")}>
          <Send aria-hidden="true" size={16} />
        </ActionButton>
      ) : null}
      {quoteStatus === "sent" || quoteStatus === "viewed" ? (
        <>
          <ActionButton label={t("crm.quote.action.accept")} onClick={() => onWorkflow("accept")}>
            <Check aria-hidden="true" size={16} />
          </ActionButton>
          <ActionButton label={t("crm.quote.action.decline")} onClick={() => onWorkflow("decline")}>
            <XCircle aria-hidden="true" size={16} />
          </ActionButton>
          <ActionButton label={t("crm.quote.action.expire")} onClick={() => onWorkflow("expire")}>
            <XCircle aria-hidden="true" size={16} />
          </ActionButton>
        </>
      ) : null}
      {!canEdit && !isAccepted ? (
        <ActionButton label={t("crm.quote.action.revise")} onClick={() => onWorkflow("revise")}>
          <RefreshCw aria-hidden="true" size={16} />
        </ActionButton>
      ) : null}
    </div>
  );
}

function ActionButton(props: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  const { children, label, onClick } = props;

  return (
    <button
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  );
}
