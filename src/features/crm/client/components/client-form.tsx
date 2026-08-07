"use client";

import { useCreateClient } from "../hooks/use-create-client";
import type { ClientFormValues } from "../types/client";
import { ClientFormBody } from "./client-form-body";

export function ClientForm() {
  const mutation = useCreateClient();
  const createClient = async (values: ClientFormValues) => {
    const ids = await mutation.createClient(values);
    window.location.assign(`/crm/clients/${ids.clientId}`);
  };

  return (
    <ClientFormBody
      errorKey="crm.client.message.createError"
      onSubmit={createClient}
      resetStatus={mutation.resetStatus}
      status={mutation.status}
      submitKey="crm.client.action.create"
      submittingKey="crm.client.action.creating"
      successKey="crm.client.message.created"
    />
  );
}
