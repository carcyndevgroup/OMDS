import type {
  AppCompanyProfileSettingsTable,
  ClientFunctions,
  ClientPortalAccessTable,
  ClientPortalDocumentViewTable,
  ClientTable,
  AppUserTable,
  ContractTable,
  ContractAuditEventTable,
  ContractTemplateVersionTable,
  ContractTemplateTable,
  EmailTemplateVersionTable,
  EmailTemplateTable,
  AppTravelSettingsTable,
  AppSigningProfileSettingsTable,
  EventCommissionTable,
  EventMessageDraftTable,
  EventContactTable,
  EventEquipmentAssignmentTable,
  EventExpenseTable,
  EventFileTable,
  EventPlannerTable,
  EventServiceTable,
  EventStaffAssignmentTable,
  EventPayrollLineItemTable,
  EventStaffPayrollTable,
  EventSatFacturaTable,
  EventTable,
  EventVenueContactTable,
  EquipmentCatalogTable,
  ExpenseCategoryTable,
  InvoiceItemTable,
  InvoiceTable,
  PlannerTable,
  ProductCatalogTable,
  PayrollTaskCatalogTable,
  PayrollPaymentBatchItemTable,
  PayrollPaymentBatchTable,
  PayrollPaymentItemTable,
  PayrollPaymentTable,
  PaymentPlanTable,
  QuestionnaireFieldCatalogTable,
  QuestionnaireTable,
  QuestionnaireTemplateTable,
  QuoteItemTable,
  QuoteRecipientTable,
  QuoteTable,
  QuoteVersionTable,
  SatBankAccountTable,
  SatFiscalProfileTable,
  SatPaymentFacturaTable,
  SatPaymentTable,
  StaffMemberTable,
  LeadServiceTable,
  LeadTable,
  VenueContactTable,
  VenueSubLocationTable,
  VenueTable,
  CrmArchiveAuditEventTable,
  CrmActivityLogTable,
  MessageAttachmentTable,
  MessageConnectionTable,
  MessageDraftTable,
  MessageParticipantTable,
  MessageTable,
  MessageThreadTable,
} from "./client-schema.types";
import type { Json } from "./json.types";

export type Database = {
  public: {
    Tables: {
      app_signing_profile_settings: AppSigningProfileSettingsTable;
      app_company_profile_settings: AppCompanyProfileSettingsTable;
      app_travel_settings: AppTravelSettingsTable;
      app_users: AppUserTable;
      client_portal_access: ClientPortalAccessTable;
      client_portal_document_views: ClientPortalDocumentViewTable;
      clients: ClientTable;
      crm_archive_audit_events: CrmArchiveAuditEventTable;
      crm_activity_log: CrmActivityLogTable;
      message_attachments: MessageAttachmentTable;
      message_connections: MessageConnectionTable;
      message_drafts: MessageDraftTable;
      message_participants: MessageParticipantTable;
      message_threads: MessageThreadTable;
      messages: MessageTable;
      contracts: ContractTable;
      contract_audit_events: ContractAuditEventTable;
      contract_template_versions: ContractTemplateVersionTable;
      contract_templates: ContractTemplateTable;
      email_template_versions: EmailTemplateVersionTable;
      email_templates: EmailTemplateTable;
      event_commissions: EventCommissionTable;
      event_contacts: EventContactTable;
      event_equipment_assignments: EventEquipmentAssignmentTable;
      event_message_drafts: EventMessageDraftTable;
      event_expenses: EventExpenseTable;
      event_files: EventFileTable;
      event_planners: EventPlannerTable;
      event_payroll_line_items: EventPayrollLineItemTable;
      event_services: EventServiceTable;
      event_staff_assignments: EventStaffAssignmentTable;
      event_staff_payroll: EventStaffPayrollTable;
      event_sat_facturas: EventSatFacturaTable;
      event_venue_contacts: EventVenueContactTable;
      events: EventTable;
      equipment_catalog: EquipmentCatalogTable;
      expense_categories: ExpenseCategoryTable;
      invoice_items: InvoiceItemTable;
      invoices: InvoiceTable;
      planners: PlannerTable;
      product_catalog: ProductCatalogTable;
      payroll_task_catalog: PayrollTaskCatalogTable;
      payroll_payment_batch_items: PayrollPaymentBatchItemTable;
      payroll_payment_batches: PayrollPaymentBatchTable;
      payroll_payment_items: PayrollPaymentItemTable;
      payroll_payments: PayrollPaymentTable;
      payment_plans: PaymentPlanTable;
      questionnaire_field_catalog: QuestionnaireFieldCatalogTable;
      questionnaire_templates: QuestionnaireTemplateTable;
      questionnaires: QuestionnaireTable;
      quote_items: QuoteItemTable;
      quote_recipients: QuoteRecipientTable;
      quote_versions: QuoteVersionTable;
      quotes: QuoteTable;
      sat_bank_accounts: SatBankAccountTable;
      sat_fiscal_profiles: SatFiscalProfileTable;
      sat_payment_facturas: SatPaymentFacturaTable;
      sat_payments: SatPaymentTable;
      staff_members: StaffMemberTable;
      venue_contacts: VenueContactTable;
      venue_sub_locations: VenueSubLocationTable;
      venues: VenueTable;
      lead_services: LeadServiceTable;
      leads: LeadTable;
    };
    Views: { [_ in never]: never };
    Functions: ClientFunctions & {
      purge_crm_clients: {
        Args: { target_client_ids: string[] };
        Returns: { deleted_client_count: number; deleted_event_count: number }[];
      };
      purge_crm_leads: {
        Args: { target_lead_ids: string[] };
        Returns: number;
      };
      create_sat_payment_with_allocations: {
        Args: { input: Json };
        Returns: string;
      };
      sync_client_portal_access: {
        Args: { target_event_id: string };
        Returns: ClientPortalAccessTable["Row"];
      };
      get_client_portal_access_by_key: {
        Args: { input_access_key: string };
        Returns: {
          access_key: string;
          client_address: string;
          client_name: string;
          contracts_visible: boolean;
          event_date: string;
          event_id: string;
          invoices_visible: boolean;
          portal_enabled: boolean;
          questionnaires_visible: boolean;
          quotes_visible: boolean;
          reviews_visible: boolean;
          venue_name: string;
        }[];
      };
      get_client_portal_quotes_by_key: {
        Args: { input_access_key: string };
        Returns: {
          apply_exchange_rate_margin: boolean;
          applies_isr_retention: boolean;
          applies_iva_retention: boolean;
          applies_iva_tax: boolean;
          display_currency: string;
          exchange_rate_margin_percent: number;
          exchange_rate_to_mxn: number;
          expires_at: string | null;
          has_been_viewed: boolean;
          issued_at: string | null;
          is_expired: boolean;
          items: Json;
          isr_retention_mxn: number;
          iva_retention_mxn: number;
          iva_tax_mxn: number;
          quote_id: string;
          quote_status: string;
          subtotal_mxn: number;
          tax_total_mxn: number;
          title: string;
          total_mxn: number;
          version_id: string;
          version_number: number;
          version_status: string;
        }[];
      };
      get_client_portal_questionnaires_by_key: {
        Args: { input_access_key: string };
        Returns: {
          has_been_viewed: boolean;
          template_definition: Json;
          questionnaire_id: string;
          response_data: Json;
          sent_at: string | null;
          status: string;
          submitted_at: string | null;
          template_key: string;
          title: string;
        }[];
      };
      respond_client_portal_quote_by_key: {
        Args: {
          input_access_key: string;
          input_action: string;
          input_quote_id: string;
        };
        Returns: undefined;
      };
      apply_approved_questionnaire_data: {
        Args: { input_questionnaire_id: string };
        Returns: undefined;
      };
      submit_client_portal_questionnaire_by_key: {
        Args: { input_access_key: string; input_questionnaire_id: string; input_response_data: Json };
        Returns: undefined;
      };
      save_client_portal_questionnaire_progress_by_key: {
        Args: { input_access_key: string; input_questionnaire_id: string; input_response_data: Json };
        Returns: undefined;
      };
      mark_client_portal_document_viewed_by_key: {
        Args: { input_access_key: string; input_document_id: string; input_document_kind: string };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadServiceRow = Database["public"]["Tables"]["lead_services"]["Row"];
