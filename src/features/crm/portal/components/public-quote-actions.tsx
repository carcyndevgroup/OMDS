"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import type { PublicPortalQuoteAction } from "../types/client-portal";

type PublicQuoteActionsProps = {
  acceptLabel: string;
  accessKey: string;
  declineLabel: string;
  quoteId: string;
  respondingLabel: string;
};

export function PublicQuoteActions(props: PublicQuoteActionsProps) {
  const { acceptLabel, accessKey, declineLabel, quoteId, respondingLabel } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PublicPortalQuoteAction | null>(null);
  const [showQuestionnairePrompt, setShowQuestionnairePrompt] = useState(false);

  const respond = async (action: PublicPortalQuoteAction) => {
    setPendingAction(action);
    const response = await fetch(`/api/portal/${accessKey}/quotes/${quoteId}`, {
      body: JSON.stringify({ action }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    setPendingAction(null);
    if (!response.ok) {
      router.refresh();
      return;
    }

    if (action === "accept") {
      setShowQuestionnairePrompt(true);
      return;
    }

    router.refresh();
  };

  const isPending = Boolean(pendingAction) || showQuestionnairePrompt;

  if (showQuestionnairePrompt) {
    return (
      <div className="mt-5 space-y-3 rounded-md border border-cyan-300/30 bg-cyan-300/10 p-4">
        <p className="text-sm font-bold text-cyan-100">
          {t("public.portal.quote.acceptedNextPrompt")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100 transition hover:border-zinc-500"
            onClick={() => {
              setShowQuestionnairePrompt(false);
              router.refresh();
            }}
            type="button"
          >
            {t("public.portal.action.stayOnQuote")}
          </button>
          <button
            className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950"
            onClick={() => {
              router.push(`/portal/${accessKey}?tab=questionnaires`);
            }}
            type="button"
          >
            {t("public.portal.action.proceedToQuestionnaire")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
      <button
        className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={() => void respond("accept")}
        type="button"
      >
        {pendingAction === "accept" ? respondingLabel : acceptLabel}
      </button>
      <button
        className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 transition hover:border-rose-300/40 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={() => void respond("decline")}
        type="button"
      >
        {pendingAction === "decline" ? respondingLabel : declineLabel}
      </button>
    </div>
  );
}
