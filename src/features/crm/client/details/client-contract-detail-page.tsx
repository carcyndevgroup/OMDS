"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useContractMutation } from "../../contract/hooks/use-contract-mutation";
import { useMessageDraftMutation } from "../../messages/hooks/use-message-draft-mutation";
import type { MessageDraftCreateInput } from "../../messages/types/message-draft";
import { useContracts } from "../../contract/hooks/use-contracts";
import { ClientContractCard } from "./client-contract-card";
import { ClientDetailSection } from "./client-detail-section";
import { ClientContractSendModal } from "./client-contract-send-modal";
import { useClientWorkspace } from "./client-workspace";

type ClientContractDetailPageProps = {
  clientId: string;
  contractId: string;
};

export function ClientContractDetailPage(props: ClientContractDetailPageProps) {
  const { clientId, contractId } = props;
  const { client, t } = useClientWorkspace();
  const eventId = client.event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.contracts")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  return <ContractDetail eventId={eventId} clientId={clientId} contractId={contractId} />;
}

function ContractDetail(props: {
  clientId: string;
  contractId: string;
  eventId: string;
}) {
  const { clientId, contractId, eventId } = props;
  const { client, t } = useClientWorkspace();
  const [showSendModal, setShowSendModal] = useState(false);
  const state = useContracts(eventId);
  const mutation = useContractMutation(eventId);
  const messageMutation = useMessageDraftMutation(eventId);
  const contract = state.contracts.find((item) => item.id === contractId);

  const workflow = async (id: string, action: "send" | "sign" | "void") => {
    await mutation.workflow(id, action);
    await state.refresh();
  };

  const saveDraft = async (input: MessageDraftCreateInput) => {
    await messageMutation.create({ ...input, status: "draft" });
    setShowSendModal(false);
  };

  const saveAndSend = async (input: MessageDraftCreateInput) => {
    await messageMutation.create({ ...input, status: "sent" });
    await workflow(contractId, "send");
    setShowSendModal(false);
  };

  return (
    <div className="space-y-4">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition hover:text-cyan-100"
        href={`/crm/clients/${clientId}?tab=contracts`}
      >
        <ArrowLeft aria-hidden="true" size={16} />
        {t("crm.client.detail.action.backToContracts")}
      </Link>

      <ClientDetailSection title={t("crm.contract.title")}>
        {state.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.contract.loading")}</p>
        ) : null}
        {state.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.contract.loadError")}</p>
        ) : null}
        {!state.isLoading && !state.hasError && !contract ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.contract.empty")}
          </p>
        ) : null}
        {contract ? (
          <>
            <ClientContractCard
              contract={contract}
              onPrepareSend={() => setShowSendModal(true)}
              onWorkflow={workflow}
              t={t}
            />
            <ClientContractBody contractId={contract.id} eventId={eventId} />
          </>
        ) : null}
      </ClientDetailSection>
      {showSendModal && contract && client.event ? (
        <ClientContractSendModal
          bookingType={client.event.bookingType}
          contacts={client.event.contacts}
          contractId={contract.id}
          contractTemplateKey={contract.templateKey}
          contractTitle={contract.title}
          eventType={client.event.eventType}
          isSaving={messageMutation.status === "loading" || mutation.status === "loading"}
          onClose={() => setShowSendModal(false)}
          onSaveAndSend={saveAndSend}
          onSaveDraft={saveDraft}
          t={t}
        />
      ) : null}
    </div>
  );
}

function ClientContractBody({ eventId, contractId }: { eventId: string; contractId: string }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[#d8c8a0] bg-[#f7eee0] p-2">
      <iframe
        className="h-[1100px] w-full rounded-[24px] bg-[#fffdf8]"
        title="Contract PDF preview"
        src={`/api/crm/events/${eventId}/contracts/${contractId}/pdf?inline=1`}
      />
    </div>
  );
}