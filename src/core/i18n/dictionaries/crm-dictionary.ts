import { clientEn, clientEs } from "./crm/client-dictionary";
import { contractEn, contractEs } from "./crm/contract-dictionary";
import { dashboardEn, dashboardEs } from "./crm/dashboard-dictionary";
import { eventFilesEn, eventFilesEs } from "./crm/event-files-dictionary";
import { eventListEn, eventListEs } from "./crm/event-list-dictionary";
import { eventEn, eventEs } from "./crm/event-dictionary";
import { invoiceEn, invoiceEs } from "./crm/invoice-dictionary";
import { leadEn, leadEs } from "./crm/lead-dictionary";
import { crmPayrollEn, crmPayrollEs } from "./crm/payroll-dictionary";
import { plannerEn, plannerEs } from "./crm/planner-dictionary";
import { portalEn, portalEs } from "./crm/portal-dictionary";
import { questionnaireEn, questionnaireEs } from "./crm/questionnaire-dictionary";
import { quoteEn, quoteEs } from "./crm/quote-dictionary";
import { staffEn, staffEs } from "./crm/staff-dictionary";
import { venueContactEn, venueContactEs } from "./crm/venue-contact-dictionary";
import { venueEventEn, venueEventEs } from "./crm/venue-event-dictionary";
import { venueListEn, venueListEs } from "./crm/venue-list-dictionary";
import { venueSettingsEn, venueSettingsEs } from "./crm/venue-settings-dictionary";
import { venueEn, venueEs } from "./crm/venue-dictionary";

export const crmEn = {
  "crm.activityLog.error": "We could not load the activity log.",
  "crm.activityLog.loading": "Loading activity...",
  "crm.activityLog.event.archived": "Record archived",
  "crm.activityLog.event.clientCreated": "Client created",
  "crm.activityLog.event.contractCreated": "Contract created",
  "crm.activityLog.event.converted": "Lead converted",
  "crm.activityLog.event.convertedFromLead": "Client created from lead",
  "crm.activityLog.event.created": "Lead created",
  "crm.activityLog.event.eventCreated": "Client event created",
  "crm.activityLog.event.eventUpdated": "Event updated",
  "crm.activityLog.event.invoiceCreated": "Invoice created",
  "crm.activityLog.event.messageCreated": "Message draft created",
  "crm.activityLog.event.messageSent": "Message sent",
  "crm.activityLog.event.quoteCreated": "Quote created",
  "crm.activityLog.event.unarchived": "Record restored",
  "crm.activityLog.event.updated": "Lead or client updated",
  ...clientEn,
  ...contractEn,
  ...dashboardEn,
  ...eventEn,
  ...eventFilesEn,
  ...eventListEn,
  ...invoiceEn,
  ...crmPayrollEn,
  ...leadEn,
  ...plannerEn,
  ...portalEn,
  ...questionnaireEn,
  ...quoteEn,
  ...staffEn,
  ...venueEn,
  ...venueContactEn,
  ...venueEventEn,
  ...venueListEn,
  ...venueSettingsEn,
} as const;

export type CrmTranslationKey = keyof typeof crmEn;

export const crmEs = {
  "crm.activityLog.error": "No se pudo cargar el registro de actividad.",
  "crm.activityLog.loading": "Cargando actividad...",
  "crm.activityLog.event.archived": "Registro archivado",
  "crm.activityLog.event.clientCreated": "Cliente creado",
  "crm.activityLog.event.contractCreated": "Contrato creado",
  "crm.activityLog.event.converted": "Lead convertido",
  "crm.activityLog.event.convertedFromLead": "Cliente creado desde lead",
  "crm.activityLog.event.created": "Lead creado",
  "crm.activityLog.event.eventCreated": "Evento del cliente creado",
  "crm.activityLog.event.eventUpdated": "Evento actualizado",
  "crm.activityLog.event.invoiceCreated": "Factura creada",
  "crm.activityLog.event.messageCreated": "Borrador de mensaje creado",
  "crm.activityLog.event.messageSent": "Mensaje enviado",
  "crm.activityLog.event.quoteCreated": "Cotización creada",
  "crm.activityLog.event.unarchived": "Registro restaurado",
  "crm.activityLog.event.updated": "Lead o cliente actualizado",
  ...clientEs,
  ...contractEs,
  ...dashboardEs,
  ...eventEs,
  ...eventFilesEs,
  ...eventListEs,
  ...invoiceEs,
  ...crmPayrollEs,
  ...leadEs,
  ...plannerEs,
  ...portalEs,
  ...questionnaireEs,
  ...quoteEs,
  ...staffEs,
  ...venueEs,
  ...venueContactEs,
  ...venueEventEs,
  ...venueListEs,
  ...venueSettingsEs,
} satisfies Record<CrmTranslationKey, string>;
