"use client";

import { CheckCircle2, Eye, Send, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { TranslationKey } from "@/core/i18n";
import { QuestionnaireApplyDiff } from "../../questionnaire/components/questionnaire-apply-diff";
import { QuestionnaireResponseView } from "../../questionnaire/components/questionnaire-response-view";
import type {
  Questionnaire,
  QuestionnaireAction,
  QuestionnaireReviewStatus,
} from "../../questionnaire/types/questionnaire";
import type { ClientDetailSectionProps } from "./client-detail-types";

const statusKeys = {
  draft: "crm.questionnaire.status.draft",
  sent: "crm.questionnaire.status.sent",
  submitted: "crm.questionnaire.status.submitted",
} as const;

const reviewStatusKeys = {
  approved: "crm.questionnaire.reviewStatus.approved",
  not_started: "crm.questionnaire.reviewStatus.not_started",
  pending_review: "crm.questionnaire.reviewStatus.pending_review",
  rejected: "crm.questionnaire.reviewStatus.rejected",
} satisfies Record<QuestionnaireReviewStatus, TranslationKey>;

type QuestionnaireCardProps = {
  client: ClientDetailSectionProps["client"];
  onPrepareSend?: (questionnaire: Questionnaire) => void;
  onWorkflow: (
    id: string,
    action: QuestionnaireAction,
    notes?: string,
  ) => Promise<void>;
  questionnaire: Questionnaire;
  t: ClientDetailSectionProps["t"];
};

export function ClientQuestionnaireCard(props: QuestionnaireCardProps) {
  const { client, onPrepareSend, onWorkflow, questionnaire, t } = props;
  const [reviewNotes, setReviewNotes] = useState(questionnaire.reviewNotes);
  const [showApplyPreview, setShowApplyPreview] = useState(false);

  const applyApproved = async () => {
    await onWorkflow(questionnaire.id, "apply_approved");
    setShowApplyPreview(false);
  };

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <QuestionnaireCardHeader
        onPrepareSend={onPrepareSend}
        onWorkflow={onWorkflow}
        questionnaire={questionnaire}
        t={t}
      />
      {questionnaire.status === "submitted" && questionnaire.reviewStatus !== "approved" ? (
        <div className="mt-5 space-y-4">
          <QuestionnaireResponseView responseData={questionnaire.responseData} t={t} />
          <label className="block text-sm font-bold text-zinc-300">
            {t("crm.questionnaire.reviewNotes")}
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-cyan-300"
              onChange={(event) => setReviewNotes(event.target.value)}
              value={reviewNotes}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <ActionButton label={t("crm.questionnaire.action.approveReview")} onClick={() => onWorkflow(questionnaire.id, "approve_review", reviewNotes)}>
              <CheckCircle2 aria-hidden="true" size={15} />
            </ActionButton>
            <ActionButton label={t("crm.questionnaire.action.rejectReview")} onClick={() => onWorkflow(questionnaire.id, "reject_review", reviewNotes)}>
              <XCircle aria-hidden="true" size={15} />
            </ActionButton>
          </div>
        </div>
      ) : null}
      {questionnaire.appliedAt ? (
        <p className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
          {t("crm.questionnaire.applied")}
        </p>
      ) : null}
      {questionnaire.reviewStatus === "approved" && !questionnaire.appliedAt ? (
        <div className="mt-4 space-y-4">
          {showApplyPreview ? <QuestionnaireApplyDiff client={client} responseData={questionnaire.responseData} t={t} /> : null}
          <ApplyActions
            isPreviewing={showApplyPreview}
            onApply={applyApproved}
            onCancel={() => setShowApplyPreview(false)}
            onPreview={() => setShowApplyPreview(true)}
            t={t}
          />
        </div>
      ) : null}
    </article>
  );
}

function QuestionnaireCardHeader(props: {
  onPrepareSend?: QuestionnaireCardProps["onPrepareSend"];
  onWorkflow: QuestionnaireCardProps["onWorkflow"];
  questionnaire: Questionnaire;
  t: ClientDetailSectionProps["t"];
}) {
  const { onPrepareSend, onWorkflow, questionnaire, t } = props;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-cyan-200">{questionnaire.title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{t(statusKeys[questionnaire.status])}</p>
        {questionnaire.status === "submitted" ? (
          <p className="mt-1 text-sm text-cyan-200">
            {t(reviewStatusKeys[questionnaire.reviewStatus])}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {questionnaire.status === "draft" ? (
          <ActionButton
            label={t("crm.questionnaire.action.send")}
            onClick={() => {
              if (onPrepareSend) {
                onPrepareSend(questionnaire);
                return;
              }

              void onWorkflow(questionnaire.id, "send");
            }}
          >
            <Send aria-hidden="true" size={15} />
          </ActionButton>
        ) : null}
        {questionnaire.status === "sent" ? (
          <ActionButton label={t("crm.questionnaire.action.markSubmitted")} onClick={() => onWorkflow(questionnaire.id, "submit")}>
            <CheckCircle2 aria-hidden="true" size={15} />
          </ActionButton>
        ) : null}
      </div>
    </div>
  );
}

function ApplyActions(props: {
  isPreviewing: boolean;
  onApply: () => void;
  onCancel: () => void;
  onPreview: () => void;
  t: ClientDetailSectionProps["t"];
}) {
  const { isPreviewing, onApply, onCancel, onPreview, t } = props;

  return (
    <div className="flex flex-wrap gap-2">
      {isPreviewing ? (
        <>
          <ActionButton label={t("crm.questionnaire.action.cancelApply")} onClick={onCancel}>
            <XCircle aria-hidden="true" size={15} />
          </ActionButton>
          <ActionButton label={t("crm.questionnaire.action.confirmApply")} onClick={onApply}>
            <CheckCircle2 aria-hidden="true" size={15} />
          </ActionButton>
        </>
      ) : (
        <ActionButton label={t("crm.questionnaire.action.previewApply")} onClick={onPreview}>
          <Eye aria-hidden="true" size={15} />
        </ActionButton>
      )}
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
      className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  );
}
