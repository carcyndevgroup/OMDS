import type { Json } from "./json.types";

export type AppTravelSettingsTable = {
  Row: {
    base_fee_mxn_per_km: number;
    created_at: string;
    fuel_consumption_l_per_100km: number;
    fuel_price_mxn_per_liter: number;
    hq_address: string;
    id: boolean;
    updated_at: string;
  };
  Insert: {
    base_fee_mxn_per_km?: number;
    created_at?: string;
    fuel_consumption_l_per_100km?: number;
    fuel_price_mxn_per_liter?: number;
    hq_address?: string;
    id?: boolean;
    updated_at?: string;
  };
  Update: Partial<AppTravelSettingsTable["Insert"]>;
  Relationships: [];
};

export type AppSigningProfileSettingsTable = {
  Row: {
    authorized_signer_full_name: string;
    authorized_signer_title: string;
    created_at: string;
    id: boolean;
    updated_at: string;
  };
  Insert: {
    authorized_signer_full_name?: string;
    authorized_signer_title?: string;
    created_at?: string;
    id?: boolean;
    updated_at?: string;
  };
  Update: Partial<AppSigningProfileSettingsTable["Insert"]>;
  Relationships: [];
};

export type AppCompanyProfileSettingsTable = {
  Row: {
    address: string;
    created_at: string;
    dba_name: string;
    email: string;
    id: boolean;
    legal_name: string;
    phone: string;
    updated_at: string;
    website: string;
  };
  Insert: {
    address?: string;
    created_at?: string;
    dba_name?: string;
    email?: string;
    id?: boolean;
    legal_name?: string;
    phone?: string;
    updated_at?: string;
    website?: string;
  };
  Update: Partial<AppCompanyProfileSettingsTable["Insert"]>;
  Relationships: [];
};

export type PaymentPlanTable = {
  Row: {
    allow_adjusted_final_balance: boolean;
    created_at: string;
    final_due_days_before_event: number;
    final_due_rule: string;
    final_payment_percent: number;
    id: string;
    is_active: boolean;
    is_default: boolean;
    name: string;
    refund_notes: string;
    retainer_due_rule: string;
    retainer_grace_period_days: number;
    retainer_percent: number;
    updated_at: string;
  };
  Insert: {
    allow_adjusted_final_balance?: boolean;
    created_at?: string;
    final_due_days_before_event?: number;
    final_due_rule?: string;
    final_payment_percent?: number;
    id?: string;
    is_active?: boolean;
    is_default?: boolean;
    name: string;
    refund_notes?: string;
    retainer_due_rule?: string;
    retainer_grace_period_days?: number;
    retainer_percent?: number;
    updated_at?: string;
  };
  Update: Partial<PaymentPlanTable["Insert"]>;
  Relationships: [];
};

export type QuestionnaireTemplateTable = {
  Row: {
    booking_type: string | null;
    created_at: string;
    definition: Json;
    description: string;
    event_type: string | null;
    id: string;
    is_active: boolean;
    is_default: boolean;
    template_key: string;
    title: string;
    updated_at: string;
  };
  Insert: {
    booking_type?: string | null;
    created_at?: string;
    definition?: Json;
    description?: string;
    event_type?: string | null;
    id?: string;
    is_active?: boolean;
    is_default?: boolean;
    template_key: string;
    title: string;
    updated_at?: string;
  };
  Update: Partial<QuestionnaireTemplateTable["Insert"]>;
  Relationships: [];
};

export type ContractTemplateTable = {
  Row: {
    body: string;
    booking_type: string | null;
    created_at: string;
    description: string;
    event_type: string | null;
    id: string;
    is_active: boolean;
    is_default: boolean;
    template_key: string;
    title: string;
    updated_at: string;
  };
  Insert: {
    body?: string;
    booking_type?: string | null;
    created_at?: string;
    description?: string;
    event_type?: string | null;
    id?: string;
    is_active?: boolean;
    is_default?: boolean;
    template_key: string;
    title: string;
    updated_at?: string;
  };
  Update: Partial<ContractTemplateTable["Insert"]>;
  Relationships: [];
};

export type ContractTemplateVersionTable = {
  Row: {
    body: string;
    booking_type: string | null;
    created_at: string;
    description: string;
    event_type: string | null;
    id: string;
    is_active: boolean;
    is_default: boolean;
    template_id: string;
    template_key: string;
    title: string;
    version_number: number;
  };
  Insert: {
    body?: string;
    booking_type?: string | null;
    created_at?: string;
    description?: string;
    event_type?: string | null;
    id?: string;
    is_active?: boolean;
    is_default?: boolean;
    template_id: string;
    template_key: string;
    title: string;
    version_number: number;
  };
  Update: Partial<ContractTemplateVersionTable["Insert"]>;
  Relationships: [];
};

export type EmailTemplateTable = {
  Row: {
    body: string;
    created_at: string;
    description: string;
    document_kind: "questionnaire" | "contract" | "invoice" | "quote" | "general";
    id: string;
    is_active: boolean;
    is_default: boolean;
    subject: string;
    template_key: string;
    title: string;
    updated_at: string;
  };
  Insert: {
    body?: string;
    created_at?: string;
    description?: string;
    document_kind?: "questionnaire" | "contract" | "invoice" | "quote" | "general";
    id?: string;
    is_active?: boolean;
    is_default?: boolean;
    subject?: string;
    template_key: string;
    title: string;
    updated_at?: string;
  };
  Update: Partial<EmailTemplateTable["Insert"]>;
  Relationships: [];
};

export type EmailTemplateVersionTable = {
  Row: {
    body: string;
    created_at: string;
    description: string;
    document_kind: "questionnaire" | "contract" | "invoice" | "quote" | "general";
    id: string;
    is_active: boolean;
    is_default: boolean;
    subject: string;
    template_id: string;
    template_key: string;
    title: string;
    version_number: number;
  };
  Insert: {
    body?: string;
    created_at?: string;
    description?: string;
    document_kind: "questionnaire" | "contract" | "invoice" | "quote" | "general";
    id?: string;
    is_active?: boolean;
    is_default?: boolean;
    subject?: string;
    template_id: string;
    template_key: string;
    title: string;
    version_number: number;
  };
  Update: Partial<EmailTemplateVersionTable["Insert"]>;
  Relationships: [];
};

export type QuestionnaireFieldCatalogTable = {
  Row: {
    created_at: string;
    field_key: string;
    helper_en: string;
    helper_es: string;
    id: string;
    is_active: boolean;
    label_en: string;
    label_es: string;
    question_type: string;
    sort_order: number;
    target_column: string;
    target_table: string;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    field_key: string;
    helper_en?: string;
    helper_es?: string;
    id?: string;
    is_active?: boolean;
    label_en: string;
    label_es: string;
    question_type: string;
    sort_order?: number;
    target_column: string;
    target_table: string;
    updated_at?: string;
  };
  Update: Partial<QuestionnaireFieldCatalogTable["Insert"]>;
  Relationships: [];
};
