import type { TranslationKey } from "@/core/i18n";

export const venueContactRoleOptions = [
  { translationKey: "crm.venue.contact.role.eventsCoordinator", value: "wedding_events_coordinator" },
  { translationKey: "crm.venue.contact.role.salesManager", value: "sales_manager" },
  { translationKey: "crm.venue.contact.role.banquetsOperations", value: "banquets_operations" },
  { translationKey: "crm.venue.contact.role.accountingFacturacion", value: "accounting_facturacion" },
  { translationKey: "crm.venue.contact.role.generalContact", value: "general_contact" },
  { translationKey: "crm.venue.contact.role.other", value: "other" },
] satisfies { translationKey: TranslationKey; value: string }[];

export const venueContactMethodOptions = [
  { translationKey: "crm.venue.contact.method.email", value: "email" },
  { translationKey: "crm.venue.contact.method.phone", value: "phone" },
  { translationKey: "crm.venue.contact.method.whatsapp", value: "whatsapp" },
  { translationKey: "crm.venue.contact.method.none", value: "none" },
] satisfies { translationKey: TranslationKey; value: string }[];
