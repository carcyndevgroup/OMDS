import { ClipboardList } from "lucide-react";
import type { ReactNode } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { formatPortalDate, getDocumentNumber } from "../utils/portal-document-presentation";

import type { PublicPortalQuestionnaire } from "../types/client-portal";
import { PublicDocumentRowActions } from "./public-document-row-actions";

type PublicQuestionnaireSectionProps = {
  accessKey: string;
  questionnaires: PublicPortalQuestionnaire[];
};

const statusKeys = {
  sent: "public.portal.questionnaire.pending",
  submitted: "crm.questionnaire.status.submitted",
} satisfies Record<PublicPortalQuestionnaire["status"], TranslationKey>;

export function PublicQuestionnaireSection({
  accessKey,
  questionnaires,
}: PublicQuestionnaireSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black text-white">
        {t("crm.portal.step.questionnaires")}
      </h2>
      {questionnaires.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          {t("public.portal.noQuestionnaires")}
        </p>
      ) : null}
      {questionnaires.length ? (
        <div className="overflow-x-auto rounded-md border border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/80">
              <tr>
                <HeaderCell>{t("public.portal.columns.id")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.name")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.dateIssued")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.status")}</HeaderCell>
                <HeaderCell alignRight>{t("public.portal.columns.actions")}</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
              {questionnaires.map((questionnaire) => (
                <tr key={questionnaire.id}>
                  <Cell className="font-bold text-cyan-200">{getDocumentNumber("questionnaire", questionnaire.id)}</Cell>
                  <Cell>
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList aria-hidden="true" size={14} />
                      {questionnaire.title}
                    </span>
                  </Cell>
                  <Cell>{formatPortalDate(questionnaire.sentAt, "en")}</Cell>
                  <Cell>
                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                      {t(statusKeys[questionnaire.status])}
                    </span>
                  </Cell>
                  <Cell alignRight>
                    <PublicDocumentRowActions
                      canDownload={questionnaire.status === "submitted" && questionnaire.hasBeenViewed}
                      downloadHref={`/api/portal/${accessKey}/documents/questionnaire/${questionnaire.id}/pdf`}
                      downloadLabel={t("public.portal.action.download")}
                      viewHref={`/portal/${accessKey}/documents/questionnaire/${questionnaire.id}`}
                      viewLabel={t("public.portal.action.view")}
                    />
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function HeaderCell(props: { alignRight?: boolean; children: string }) {
  return (
    <th
      className={[
        "px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500",
        props.alignRight ? "text-right" : "",
      ].join(" ")}
      scope="col"
    >
      {props.children}
    </th>
  );
}

function Cell(props: { alignRight?: boolean; children: ReactNode; className?: string }) {
  return (
    <td
      className={[
        "px-3 py-3 text-zinc-200",
        props.alignRight ? "text-right" : "",
        props.className ?? "",
      ].join(" ")}
    >
      {props.children}
    </td>
  );
}
