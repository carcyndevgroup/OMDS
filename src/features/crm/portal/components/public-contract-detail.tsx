"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import type { PublicPortalContract } from "../repositories/public-portal-documents-repository";

type PublicContractDetailProps = {
  accessKey: string;
  contract: PublicPortalContract;
  showDownloadAction?: boolean;
};

export function PublicContractDetail(props: PublicContractDetailProps) {
  const { accessKey, contract, showDownloadAction = true } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [isSigning, setIsSigning] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showInvoicesPrompt, setShowInvoicesPrompt] = useState(false);

  const sign = async () => {
    setIsSigning(true);
    const response = await fetch(`/api/portal/${accessKey}/contracts/${contract.contractId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted: hasAccepted }),
    });
    setIsSigning(false);
    if (!response.ok) {
      router.refresh();
      return;
    }
    setShowInvoicesPrompt(true);
  };

  if (showInvoicesPrompt) {
    return (
      <article className="space-y-4 rounded-md border border-cyan-300/25 bg-cyan-300/10 p-5">
        <p className="text-sm font-bold text-cyan-100">{t("public.portal.contract.signedNextPrompt")}</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100"
            onClick={() => setShowInvoicesPrompt(false)}
            type="button"
          >
            {t("public.portal.action.stayOnContract")}
          </button>
          <button
            className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950"
            onClick={() => router.push(`/portal/${accessKey}?tab=invoices`)}
            type="button"
          >
            {t("public.portal.action.proceedToInvoices")}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-cyan-200">{contract.title}</h3>
          <p className="mt-2 text-sm text-zinc-500">
            {t(contract.status === "signed" ? "crm.contract.status.signed" : "crm.contract.status.sent")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showDownloadAction ? (
            contract.hasBeenViewed ? (
              <a
                className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100"
                href={`/api/portal/${accessKey}/documents/contract/${contract.contractId}/pdf`}
              >
                {t("public.portal.action.download")}
              </a>
            ) : (
              <p className="text-xs font-bold text-zinc-500">{t("public.portal.download.locked")}</p>
            )
          ) : null}
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 p-2">
        <iframe
          className="h-[1100px] w-full rounded-md bg-[#fffdf8]"
          title={contract.title}
          src={`/api/portal/${accessKey}/documents/contract/${contract.contractId}/pdf?inline=1`}
        />
      </div>
      {contract.status === "sent" ? (
        <div className="mt-5 space-y-3 rounded-md border border-zinc-700 bg-zinc-950 p-4">
          <label className="flex cursor-pointer gap-3 text-sm leading-6 text-zinc-200">
            <input checked={hasAccepted} className="mt-1 h-4 w-4 accent-cyan-300" onChange={(event) => setHasAccepted(event.target.checked)} type="checkbox" />
            <span>[ ] By checking this box, I acknowledge that I am signing this agreement electronically and that my electronic signature is the legally binding equivalent of my handwritten signature.</span>
          </label>
          <button
            className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
            disabled={isSigning || !hasAccepted}
            onClick={() => void sign()}
            type="button"
          >
            {isSigning ? t("public.portal.contract.signing") : t("public.portal.contract.sign")}
          </button>
        </div>
      ) : null}
    </article>
  );
}
