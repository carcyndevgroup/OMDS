import type { Json } from "./json.types";

export type ClientPortalAccessTable = {
  Row: {
    access_key: string;
    contracts_visible: boolean;
    created_at: string;
    event_id: string;
    invoices_visible: boolean;
    portal_enabled: boolean;
    questionnaires_visible: boolean;
    quotes_visible: boolean;
    reviews_visible: boolean;
    revoked_at: string | null;
    synced_at: string;
    updated_at: string;
  };
  Insert: {
    access_key?: string;
    contracts_visible?: boolean;
    created_at?: string;
    event_id: string;
    invoices_visible?: boolean;
    portal_enabled?: boolean;
    questionnaires_visible?: boolean;
    quotes_visible?: boolean;
    reviews_visible?: boolean;
    revoked_at?: string | null;
    synced_at?: string;
    updated_at?: string;
  };
  Update: Partial<ClientPortalAccessTable["Insert"]>;
  Relationships: [];
};

export type ClientPortalDocumentViewTable = {
  Row: {
    access_key: string;
    created_at: string;
    document_id: string;
    document_kind: string;
    updated_at: string;
    viewed_at: string;
  };
  Insert: {
    access_key: string;
    created_at?: string;
    document_id: string;
    document_kind: string;
    updated_at?: string;
    viewed_at?: string;
  };
  Update: Partial<ClientPortalDocumentViewTable["Insert"]>;
  Relationships: [];
};

export type EventMessageDraftTable = {
  Row: {
    body: string;
    channel: string;
    created_at: string;
    document_id: string | null;
    document_kind: string;
    event_id: string;
    id: string;
    metadata: Json;
    recipients: Json;
    sent_at: string | null;
    status: string;
    subject: string;
    updated_at: string;
  };
  Insert: {
    body?: string;
    channel?: string;
    created_at?: string;
    document_id?: string | null;
    document_kind: string;
    event_id: string;
    id?: string;
    metadata?: Json;
    recipients?: Json;
    sent_at?: string | null;
    status?: string;
    subject?: string;
    updated_at?: string;
  };
  Update: Partial<EventMessageDraftTable["Insert"]>;
  Relationships: [];
};

export type ContractTable = {
  Row: {
    contract_data: Json;
    created_at: string;
    event_id: string;
    id: string;
    internal_notes: string;
    legal_signature_name: string;
    locale: string;
    sent_at: string | null;
    signed_at: string | null;
    status: string;
    template_key: string;
    title: string;
    updated_at: string;
    voided_at: string | null;
  };
  Insert: {
    contract_data?: Json;
    created_at?: string;
    event_id: string;
    id?: string;
    internal_notes?: string;
    legal_signature_name?: string;
    locale?: string;
    sent_at?: string | null;
    signed_at?: string | null;
    status?: string;
    template_key?: string;
    title?: string;
    updated_at?: string;
    voided_at?: string | null;
  };
  Update: Partial<ContractTable["Insert"]>;
  Relationships: [];
};

export type ContractAuditEventTable = {
  Row: {
    id: string;
    contract_id: string;
    event_type: string;
    occurred_at: string;
    actor_type: string;
    authentication_method: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Json;
  };
  Insert: {
    id?: string;
    contract_id: string;
    event_type: string;
    occurred_at?: string;
    actor_type?: string;
    authentication_method?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: Json;
  };
  Update: Partial<ContractAuditEventTable["Insert"]>;
  Relationships: [];
};

export type InvoiceTable = {
  Row: {
    client_visible: boolean;
    contract_id: string | null;
    created_at: string;
    display_currency: string;
    due_at: string | null;
    event_id: string;
    id: string;
    invoice_type: string;
    installment_key: string;
    issued_at: string | null;
    paid_at: string | null;
    payment_promised_at: string | null;
    quote_version_id: string | null;
    status: string;
    subtotal_mxn: number;
    tax_total_mxn: number;
    total_mxn: number;
    updated_at: string;
  };
  Insert: {
    client_visible?: boolean;
    contract_id?: string | null;
    created_at?: string;
    display_currency?: string;
    due_at?: string | null;
    event_id: string;
    id?: string;
    invoice_type?: string;
    installment_key?: string;
    issued_at?: string | null;
    paid_at?: string | null;
    payment_promised_at?: string | null;
    quote_version_id?: string | null;
    status?: string;
    subtotal_mxn?: number;
    tax_total_mxn?: number;
    total_mxn?: number;
    updated_at?: string;
  };
  Update: Partial<InvoiceTable["Insert"]>;
  Relationships: [];
};

export type InvoiceItemTable = {
  Row: {
    applied_at: string | null;
    apply_notes: string;
    created_at: string;
    description: string;
    details: string;
    id: string;
    invoice_id: string;
    is_taxable: boolean;
    line_total_mxn: number;
    quantity: number;
    sort_order: number;
    unit_price_mxn: number;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    description: string;
    details?: string;
    id?: string;
    invoice_id: string;
    is_taxable?: boolean;
    line_total_mxn?: number;
    quantity?: number;
    sort_order?: number;
    unit_price_mxn?: number;
    updated_at?: string;
  };
  Update: Partial<InvoiceItemTable["Insert"]>;
  Relationships: [];
};

export type EventCommissionTable = {
  Row: {
    amount_mxn: number;
    base_amount_mxn: number;
    calculation_model: string;
    commission_type: string;
    created_at: string;
    event_id: string;
    id: string;
    notes: string;
    payee_name: string;
    percentage: number | null;
    related_planner_id: string | null;
    related_venue_id: string | null;
    status: string;
    updated_at: string;
  };
  Insert: {
    amount_mxn?: number;
    base_amount_mxn?: number;
    calculation_model?: string;
    commission_type: string;
    created_at?: string;
    event_id: string;
    id?: string;
    notes?: string;
    payee_name?: string;
    percentage?: number | null;
    related_planner_id?: string | null;
    related_venue_id?: string | null;
    status?: string;
    updated_at?: string;
  };
  Update: Partial<EventCommissionTable["Insert"]>;
  Relationships: [];
};

export type QuestionnaireTable = {
  Row: {
    applied_at: string | null;
    apply_notes: string;
    created_at: string;
    event_id: string;
    id: string;
    internal_change_notes: string;
    locale: string;
    response_data: Json;
    review_notes: string;
    review_status: string;
    reviewed_at: string | null;
    sent_at: string | null;
    status: string;
    submitted_at: string | null;
    template_key: string;
    title: string;
    updated_at: string;
  };
  Insert: {
    applied_at?: string | null;
    apply_notes?: string;
    created_at?: string;
    event_id: string;
    id?: string;
    internal_change_notes?: string;
    locale?: string;
    response_data?: Json;
    review_notes?: string;
    review_status?: string;
    reviewed_at?: string | null;
    sent_at?: string | null;
    status?: string;
    submitted_at?: string | null;
    template_key?: string;
    title?: string;
    updated_at?: string;
  };
  Update: Partial<QuestionnaireTable["Insert"]>;
  Relationships: [];
};
