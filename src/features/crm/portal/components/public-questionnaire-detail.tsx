"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import type { PublicPortalQuestionnaire } from "../types/client-portal";
import { PublicBookingQuestionnaireForm } from "./public-booking-questionnaire-form";
import { QuestionnaireResponseView } from "../../questionnaire/components/questionnaire-response-view";

type PublicQuestionnaireDetailProps = {
  accessKey: string;
  questionnaire: PublicPortalQuestionnaire;
  showDownloadAction?: boolean;
};

const statusKeys = {
  sent: "public.portal.questionnaire.pending",
  submitted: "crm.questionnaire.status.submitted",
} satisfies Record<PublicPortalQuestionnaire["status"], TranslationKey>;

export function PublicQuestionnaireDetail(props: PublicQuestionnaireDetailProps) {
  const { accessKey, questionnaire, showDownloadAction = true } = props;
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5" id={`questionnaire-${questionnaire.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-black text-cyan-200">
            <ClipboardList aria-hidden="true" size={20} />
            {questionnaire.title}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">{t(statusKeys[questionnaire.status])}</p>
        </div>
        {showDownloadAction ? (
          questionnaire.status === "submitted" && questionnaire.hasBeenViewed ? (
            <a
              className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100"
              href={`/api/portal/${accessKey}/documents/questionnaire/${questionnaire.id}/pdf`}
            >
              {t("public.portal.action.download")}
            </a>
          ) : (
            <p className="text-xs font-bold text-zinc-500">{t("public.portal.download.locked")}</p>
          )
        ) : null}
        {questionnaire.status === "submitted" ? (
          <button
            className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100"
            onClick={() => setIsEditing((current) => !current)}
            type="button"
          >
            {isEditing ? t("crm.questionnaire.action.cancelApply") : t("public.questionnaire.action.resubmit")}
          </button>
        ) : null}
      </div>
      {questionnaire.status === "sent" || isEditing ? (
        <div className="mt-5 border-t border-zinc-800 pt-5">
          <PublicBookingQuestionnaireForm
            accessKey={accessKey}
            isResubmission={questionnaire.status === "submitted"}
            questionnaireId={questionnaire.id}
            responseData={questionnaire.responseData}
            templateDefinition={questionnaire.templateDefinition}
          />
        </div>
      ) : (
        <div className="mt-5 border-t border-zinc-800 pt-5">
          <QuestionnaireResponseView responseData={questionnaire.responseData} t={t} />
        </div>
      )}
    </article>
  );
}
