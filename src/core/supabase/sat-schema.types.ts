export type EventSatFacturaTable = {
  Row: {
    accountant_requested_at: string | null;
    accountant_request_text: string;
    bank_account_id: string | null;
    cfdi_use: string;
    commission_mxn: number;
    complemento_pdf_url: string;
    complemento_received_at: string | null;
    complemento_requested_at: string | null;
    complemento_sent_at: string | null;
    complemento_status: string;
    complemento_xml_url: string;
    created_at: string;
    creation_source: string;
    currency: string;
    due_at: string | null;
    event_id: string;
    exchange_rate_source: string;
    exchange_rate_to_mxn: number;
    factura_number: string;
    factura_pdf_url: string;
    factura_xml_url: string;
    fiscal_profile_id: string | null;
    id: string;
    issued_at: string | null;
    iva_mxn: number;
    iva_retention_mxn: number;
    isr_retention_mxn: number;
    notes: string;
    paid_at: string | null;
    pax: number | null;
    payment_form: string;
    payment_method: string;
    payment_partner_venue_id: string | null;
    quote_version_id: string | null;
    recipient_client_id: string | null;
    recipient_name: string;
    recipient_type: string;
    requires_complemento: boolean;
    rfc: string;
    sent_to_venue_at: string | null;
    service_description: string;
    source_total_mxn: number;
    status: string;
    subtotal_mxn: number;
    tax_object: string;
    tax_regime: string;
    tax_total_mxn: number;
    total_mxn: number;
    unit_value_mxn: number;
    updated_at: string;
    uuid_fiscal: string;
    venue_id: string | null;
  };
  Insert: Partial<Omit<EventSatFacturaTable["Row"], "event_id">> & {
    event_id: string;
  };
  Update: Partial<EventSatFacturaTable["Insert"]>;
  Relationships: [];
};

export type SatFiscalProfileTable = {
  Row: {
    constancia_file_url: string;
    created_at: string;
    id: string;
    is_active: boolean;
    label: string;
    legal_name: string;
    opinion_expires_at: string | null;
    opinion_file_url: string;
    rfc: string;
    tax_regime: string;
    updated_at: string;
  };
  Insert: {
    constancia_file_url?: string;
    created_at?: string;
    id?: string;
    is_active?: boolean;
    label: string;
    legal_name?: string;
    opinion_expires_at?: string | null;
    opinion_file_url?: string;
    rfc?: string;
    tax_regime?: string;
    updated_at?: string;
  };
  Update: Partial<SatFiscalProfileTable["Insert"]>;
  Relationships: [];
};

export type SatBankAccountTable = {
  Row: {
    account_number: string;
    bank_name: string;
    beneficiary_name: string;
    clabe: string;
    created_at: string;
    currency: string;
    fiscal_profile_id: string | null;
    id: string;
    is_active: boolean;
    nickname: string;
    updated_at: string;
  };
  Insert: {
    account_number?: string;
    bank_name?: string;
    beneficiary_name?: string;
    clabe?: string;
    created_at?: string;
    currency?: string;
    fiscal_profile_id?: string | null;
    id?: string;
    is_active?: boolean;
    nickname: string;
    updated_at?: string;
  };
  Update: Partial<SatBankAccountTable["Insert"]>;
  Relationships: [];
};

export type SatPaymentTable = {
  Row: {
    amount_mxn: number;
    bank_account_id: string | null;
    created_at: string;
    id: string;
    notes: string;
    payment_date: string;
    proof_file_url: string;
    reference: string;
    updated_at: string;
    venue_id: string | null;
  };
  Insert: {
    amount_mxn: number;
    bank_account_id?: string | null;
    created_at?: string;
    id?: string;
    notes?: string;
    payment_date: string;
    proof_file_url?: string;
    reference?: string;
    updated_at?: string;
    venue_id?: string | null;
  };
  Update: Partial<SatPaymentTable["Insert"]>;
  Relationships: [];
};

export type SatPaymentFacturaTable = {
  Row: {
    amount_applied_mxn: number;
    created_at: string;
    factura_id: string;
    payment_id: string;
  };
  Insert: {
    amount_applied_mxn: number;
    created_at?: string;
    factura_id: string;
    payment_id: string;
  };
  Update: Partial<SatPaymentFacturaTable["Insert"]>;
  Relationships: [];
};
