export {
  bookingStatusOptions,
  bookingTypeOptions,
  clientModule,
  type BookingType,
  type Client,
  type ClientDetail,
  type ClientEvent,
  type ClientFormValues,
  type ClientListItem,
  type EventContact,
  createClientService,
  initialClientFormValues,
  parseClientFormValues,
  validateClientForm,
  type ClientFormErrors,
} from "./client";
export { crmModules } from "./modules";
export { plannerModule } from "./planner";
export type {
  BookingStatus,
  ContactRole,
} from "./shared/types/crm-options";
export type {
  CrmEntityKind,
  CrmModuleDefinition,
  CrmRecordMeta,
} from "./shared/types/crm-record";
export { venueModule, type Venue, type VenueFormValues } from "./venue";
export {
  eventTypeOptions,
  leadRoleOptions,
  leadSourceOptions,
  leadStatusOptions,
} from "./lead/constants/lead-options";
export { leadFormSections } from "./lead/constants/lead-form-sections";
export {
  serviceGroups,
  serviceIds,
  serviceOptions,
  type ServiceFamily,
  type ServiceGroup,
  type ServiceOption,
} from "./shared/constants/service-options";
export { LeadForm } from "./lead/components/lead-form";
export { LeadDetails } from "./lead/details/lead-details";
export { LeadEdit } from "./lead/edit/lead-edit";
export { useCreateLead } from "./lead/hooks/use-create-lead";
export { useLeadForm } from "./lead/hooks/use-lead-form";
export { createInMemoryLeadRepository } from "./lead/repositories/in-memory-lead-repository";
export { createSupabaseLeadRepository } from "./lead/repositories/supabase-lead-repository";
export type { LeadRepository } from "./lead/repositories/lead-repository";
export {
  initialLeadFormValues,
  validateLeadForm,
  type LeadFormErrors,
} from "./lead/schemas/lead-schema";
export { parseLeadFormValues } from "./lead/schemas/lead-form-parser";
export { leadModule } from "./lead/module";
export { createLeadApiService } from "./lead/services/lead-api-service";
export { createLeadService } from "./lead/services/lead-service";
export type {
  EventType,
  Lead,
  LeadFormValues,
  LeadRole,
  LeadSource,
  LeadStatus,
  ServiceCategory,
} from "./lead/types/lead";
