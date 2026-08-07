"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useMessageDraftMutation } from "../../messages/hooks/use-message-draft-mutation";
import type { MessageDraftCreateInput } from "../../messages/types/message-draft";
import { useQuestionnaireMutation } from "../../questionnaire/hooks/use-questionnaire-mutation";
import type { QuestionnaireAction } from "../../questionnaire/types/questionnaire";
import { useQuestionnaires } from "../../questionnaire/hooks/use-questionnaires";
import { ClientDetailSection } from "./client-detail-section";
import { ClientQuestionnaireCard } from "./client-questionnaire-card";
import { ClientQuestionnaireSendModal } from "./client-questionnaire-send-modal";
import { useClientWorkspace } from "./client-workspace";

type ClientQuestionnaireDetailPageProps = {
  clientId: string;
  questionnaireId: string;
};

export function ClientQuestionnaireDetailPage(props: ClientQuestionnaireDetailPageProps) {
  const { clientId, questionnaireId } = props;
  const { client, t } = useClientWorkspace();
  const eventId = client.event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.questionnaires")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  return (
    <QuestionnaireDetail
      clientId={clientId}
      eventId={eventId}
      questionnaireId={questionnaireId}
    />
  );
}

function QuestionnaireDetail(props: {
  clientId: string;
  eventId: string;
  questionnaireId: string;
}) {
  const { clientId, eventId, questionnaireId } = props;
  const { client, refreshClient, t } = useClientWorkspace();
  const [showSendModal, setShowSendModal] = useState(false);
  const state = useQuestionnaires(eventId);
  const messageMutation = useMessageDraftMutation(eventId);
  const mutation = useQuestionnaireMutation(eventId);
  const questionnaire = state.questionnaires.find((item) => item.id === questionnaireId);

  const workflow = async (
    id: string,
    action: QuestionnaireAction,
    notes = "",
  ) => {
    await mutation.workflow(id, action, notes, action === "apply_approved" ? clientId : undefined);
    await state.refresh();
    if (action === "apply_approved") await refreshClient();
  };

  const saveDraft = async (input: MessageDraftCreateInput) => {
    await messageMutation.create({ ...input, status: "draft" });
    setShowSendModal(false);
  };

  const saveAndSend = async (input: MessageDraftCreateInput) => {
    await messageMutation.create({ ...input, status: "sent" });
    await workflow(questionnaireId, "send");
    setShowSendModal(false);
  };

  return (
    <div className="space-y-4">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition hover:text-cyan-100"
        href={`/crm/clients/${clientId}?tab=questionnaires`}
      >
        <ArrowLeft aria-hidden="true" size={16} />
        {t("crm.client.detail.action.backToQuestionnaires")}
      </Link>

      <ClientDetailSection title={t("crm.questionnaire.title")}>
        {state.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.questionnaire.loading")}</p>
        ) : null}
        {state.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.questionnaire.loadError")}</p>
        ) : null}
        {!state.isLoading && !state.hasError && !questionnaire ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.questionnaire.empty")}
          </p>
        ) : null}
        {questionnaire ? (
          <ClientQuestionnaireCard
            client={client}
            onPrepareSend={() => setShowSendModal(true)}
            onWorkflow={workflow}
            questionnaire={questionnaire}
            t={t}
          />
        ) : null}
      </ClientDetailSection>
      {showSendModal && questionnaire && client.event ? (
        <ClientQuestionnaireSendModal
          bookingType={client.event.bookingType}
          contacts={client.event.contacts}
          eventType={client.event.eventType}
          isSaving={messageMutation.status === "loading" || mutation.status === "loading"}
          onClose={() => setShowSendModal(false)}
          onSaveAndSend={saveAndSend}
          onSaveDraft={saveDraft}
          questionnaireId={questionnaire.id}
          questionnaireTemplateKey={questionnaire.templateKey}
          questionnaireTitle={questionnaire.title}
          t={t}
        />
      ) : null}
    </div>
  );
}