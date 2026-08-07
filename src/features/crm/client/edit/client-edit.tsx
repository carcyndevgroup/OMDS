"use client";

import { ClientFormBody } from "../components/client-form-body";
import { useUpdateClient } from "../hooks/use-update-client";
import { useClientWorkspace } from "../details/client-workspace";
import { clientDetailToFormValues } from "./client-detail-to-form-values";

export function ClientEdit() {
  const { client, t } = useClientWorkspace();
  const eventId = client.event?.id ?? "";
  const mutation = useUpdateClient(client.id, eventId);
  const values = clientDetailToFormValues(client);

  if (!values || !eventId) {
    return (
      <p className="py-12 text-center text-sm text-rose-300">
        {t("crm.client.edit.noEvent")}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">{t("crm.client.edit.title")}</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {t("crm.client.edit.subtitle")}
        </p>
      </div>
      <ClientFormBody
        errorKey="crm.client.edit.error"
        initialValues={values}
        onSubmit={mutation.updateClient}
        onSuccess={() => window.location.assign(`/crm/clients/${client.id}`)}
        resetStatus={mutation.resetStatus}
        status={mutation.status}
        submitKey="crm.client.edit.save"
        submittingKey="crm.client.edit.saving"
        successKey="crm.client.edit.success"
      />
    </div>
  );
}
