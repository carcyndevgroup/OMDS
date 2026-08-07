"use client";

import { Ban, CheckCircle2, Send } from "lucide-react";
import type { ReactNode } from "react";

import type { Contract } from "../../contract/types/contract";
import type { ClientDetailSectionProps } from "./client-detail-types";

const statusKeys = {
  draft: "crm.contract.status.draft",
  sent: "crm.contract.status.sent",
  signed: "crm.contract.status.signed",
  void: "crm.contract.status.void",
} as const;

type ClientContractCardProps = {
  contract: Contract;
  onPrepareSend?: (contract: Contract) => void;
  onWorkflow: (id: string, action: "send" | "sign" | "void") => Promise<void>;
  t: ClientDetailSectionProps["t"];
};

export function ClientContractCard(props: ClientContractCardProps) {
  const { contract, onPrepareSend, onWorkflow, t } = props;
  const title = contract.title;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-200">{title}</h3>
          <p className="mt-2 text-sm text-zinc-500">
            {t(statusKeys[contract.status])}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contract.status === "draft" ? (
            <ActionButton
              label={t("crm.contract.action.send")}
              onClick={() => {
                if (onPrepareSend) {
                  onPrepareSend(contract);
                  return;
                }

                void onWorkflow(contract.id, "send");
              }}
            >
              <Send aria-hidden="true" size={15} />
            </ActionButton>
          ) : null}
          {contract.status === "sent" ? (
            <ActionButton label={t("crm.contract.action.markSigned")} onClick={() => onWorkflow(contract.id, "sign")}>
              <CheckCircle2 aria-hidden="true" size={15} />
            </ActionButton>
          ) : null}
          {contract.status !== "signed" && contract.status !== "void" ? (
            <ActionButton label={t("crm.contract.action.void")} onClick={() => onWorkflow(contract.id, "void")}>
              <Ban aria-hidden="true" size={15} />
            </ActionButton>
          ) : null}
        </div>
      </div>
    </article>
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
      className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  );
}