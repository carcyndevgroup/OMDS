"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { Json } from "@/core/supabase/json.types";

import { useQuestionnaires } from "../../questionnaire/hooks/use-questionnaires";
import type { Questionnaire } from "../../questionnaire/types/questionnaire";
import { ConfirmationDialog } from "../../shared/components/confirmation-dialog";
import { buildDocumentNumber } from "../../shared/documents/document-identifiers";
import { ClientRowActionsMenu } from "./client-row-actions-menu";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

type QuestionnaireAttachment = {
  fieldKey: string;
  fileName: string;
  id: string;
  path: string;
  questionnaireId: string;
  questionnaireTitle: string;
  uploadedAt: string | null;
};

export function ClientFilesTab(props: ClientDetailSectionProps) {
  const { client, locale, t } = props;
  const event = client.event;
  const eventId = event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.event.detail.tab.files")}>
        <p className="text-sm text-zinc-500">{t("crm.client.detail.empty.event")}</p>
      </ClientDetailSection>
    );
  }

  return <FileList eventId={eventId} locale={locale} t={t} />;
}

function FileList(props: Pick<ClientDetailSectionProps, "locale" | "t"> & { eventId: string }) {
  const { eventId, locale, t } = props;
  const state = useQuestionnaires(eventId);
  const [deleteTarget, setDeleteTarget] = useState<QuestionnaireAttachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingOpenId, setPendingOpenId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attachments = useMemo(
    () => listQuestionnaireAttachments(state.questionnaires),
    [state.questionnaires],
  );

  const openAttachment = async (attachment: QuestionnaireAttachment) => {
    setErrorMessage(null);
    setPendingOpenId(attachment.id);

    try {
      const response = await fetch(
        `/api/crm/events/${eventId}/questionnaires/${attachment.questionnaireId}/uploads/sign`,
        {
          body: JSON.stringify({ path: attachment.path }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("open_upload_failed");
      const payload = (await response.json()) as { signedUrl?: unknown };
      const signedUrl = typeof payload.signedUrl === "string" ? payload.signedUrl : "";
      if (!signedUrl) throw new Error("open_upload_failed");

      if (typeof window !== "undefined") {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setErrorMessage(t("public.questionnaire.upload.error"));
    } finally {
      setPendingOpenId(null);
    }
  };

  const requestDeleteAttachment = (attachment: QuestionnaireAttachment) => {
    setDeleteTarget(attachment);
  };

  const deleteAttachment = async () => {
    if (!deleteTarget) return;

    setErrorMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/crm/events/${eventId}/questionnaires/${deleteTarget.questionnaireId}/uploads`,
        {
          body: JSON.stringify({ path: deleteTarget.path }),
          headers: { "Content-Type": "application/json" },
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("delete_upload_failed");
      await state.refresh();
      setDeleteTarget(null);
    } catch {
      setErrorMessage(t("public.questionnaire.upload.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ClientDetailSection title={t("crm.event.detail.tab.files")}>
      <div className="space-y-4">
        {state.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.questionnaire.loading")}</p>
        ) : null}
        {state.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.questionnaire.loadError")}</p>
        ) : null}
        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

        {!state.isLoading && attachments.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.event.files.empty")}
          </p>
        ) : null}

        {attachments.length ? (
          <div className="overflow-visible rounded-md border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead className="bg-zinc-900/80">
                  <tr>
                    <Head>{t("crm.client.detail.field.questionnaireId")}</Head>
                    <Head>{t("crm.client.detail.field.questionnaireName")}</Head>
                    <Head>{t("crm.event.files.field.name")}</Head>
                    <Head>{t("crm.client.detail.field.sentDate")}</Head>
                    <Head alignRight>{t("public.portal.columns.actions")}</Head>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                  {attachments.map((attachment) => (
                    <tr key={attachment.id}>
                      <Cell className="font-bold text-cyan-200">
                        {buildDocumentNumber("questionnaire", attachment.questionnaireId)}
                      </Cell>
                      <Cell>{attachment.questionnaireTitle}</Cell>
                      <Cell>
                        <div className="space-y-1">
                          <p>{attachment.fileName}</p>
                          <p className="text-xs text-zinc-500">{attachment.fieldKey}</p>
                        </div>
                      </Cell>
                      <Cell>{formatDateTime(attachment.uploadedAt, locale)}</Cell>
                      <Cell alignRight>
                        <ClientRowActionsMenu
                          actions={[
                            {
                              disabled: pendingOpenId === attachment.id,
                              label: t("public.questionnaire.upload.open"),
                              onClick: () => {
                                void openAttachment(attachment);
                              },
                            },
                            {
                              disabled: isDeleting,
                              label: t("public.questionnaire.upload.remove"),
                              onClick: () => {
                                requestDeleteAttachment(attachment);
                              },
                            },
                          ]}
                          label={t("public.portal.columns.actions")}
                        />
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
      <ConfirmationDialog
        confirmKey="public.questionnaire.upload.remove"
        isOpen={Boolean(deleteTarget)}
        isWorking={isDeleting}
        messageKey="crm.questionnaire.upload.confirmDeleteBody"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void deleteAttachment();
        }}
        t={t}
        titleKey="crm.questionnaire.upload.confirmDeleteTitle"
      />
    </ClientDetailSection>
  );
}

function listQuestionnaireAttachments(questionnaires: Questionnaire[]) {
  const attachments: QuestionnaireAttachment[] = [];

  for (const questionnaire of questionnaires) {
    const root = asRecord(questionnaire.responseData);
    const dynamicResponses = asRecord(root.dynamicResponses);

    for (const [fieldKey, value] of Object.entries(dynamicResponses)) {
      if (!Array.isArray(value)) continue;

      for (const item of value) {
        const attachment = asAttachment(item);
        if (!attachment) continue;

        attachments.push({
          fieldKey,
          fileName: attachment.fileName,
          id: `${questionnaire.id}:${fieldKey}:${attachment.path}`,
          path: attachment.path,
          questionnaireId: questionnaire.id,
          questionnaireTitle: questionnaire.title,
          uploadedAt: attachment.uploadedAt ?? questionnaire.updatedAt,
        });
      }
    }
  }

  return attachments.sort((a, b) => {
    const left = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const right = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return right - left;
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asAttachment(value: unknown): { fileName: string; path: string; uploadedAt?: string } | null {
  const record = asRecord(value);
  const fileName = typeof record.fileName === "string" ? record.fileName : "";
  const path = typeof record.path === "string" ? record.path : "";
  const uploadedAt = typeof record.uploadedAt === "string" ? record.uploadedAt : undefined;

  if (!fileName || !path) return null;
  return { fileName, path, uploadedAt };
}

function Head(props: { alignRight?: boolean; children: string }) {
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

function formatDateTime(value: string | null, locale: "en" | "es") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
