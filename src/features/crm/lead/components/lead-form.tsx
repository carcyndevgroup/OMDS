"use client";

import { useCreateLead } from "../hooks/use-create-lead";
import type { LeadFormValues } from "../types/lead";
import { LeadFormBody } from "./lead-form-body";

export function LeadForm() {
  const mutation = useCreateLead();
  const createLead = async (values: LeadFormValues) => {
    const lead = await mutation.createLead(values);
    window.location.assign(`/crm/leads/${lead.id}`);
  };

  return (
    <LeadFormBody
      errorKey="crm.lead.message.createError"
      onSubmit={createLead}
      resetStatus={mutation.resetStatus}
      status={mutation.status}
      submitKey="crm.lead.action.save"
      submittingKey="crm.lead.action.saving"
      successKey="crm.lead.message.created"
    />
  );
}
