import type { Translate } from "../types/form-types";

const eventLabels: Record<string, Parameters<Translate>[0]> = {
  archived: "crm.activityLog.event.archived",
  client_created: "crm.activityLog.event.clientCreated",
  contract_created: "crm.activityLog.event.contractCreated",
  converted: "crm.activityLog.event.converted",
  converted_from_lead: "crm.activityLog.event.convertedFromLead",
  created: "crm.activityLog.event.created",
  event_created: "crm.activityLog.event.eventCreated",
  event_updated: "crm.activityLog.event.eventUpdated",
  invoice_created: "crm.activityLog.event.invoiceCreated",
  message_created: "crm.activityLog.event.messageCreated",
  message_sent: "crm.activityLog.event.messageSent",
  quote_created: "crm.activityLog.event.quoteCreated",
  unarchived: "crm.activityLog.event.unarchived",
  updated: "crm.activityLog.event.updated",
};

export function resolveActivityLabel(
  eventType: string,
  summary: string,
  t: Translate,
) {
  return eventLabels[eventType] ? t(eventLabels[eventType]) : summary;
}
