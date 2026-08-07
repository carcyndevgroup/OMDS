export type QuoteTable = {
  Row: {
    accepted_version_id: string | null;
    created_at: string;
    event_id: string;
    id: string;
    status: string;
    title: string;
    updated_at: string;
  };
  Insert: {
    accepted_version_id?: string | null;
    created_at?: string;
    event_id: string;
    id?: string;
    status?: string;
    title: string;
    updated_at?: string;
  };
  Update: Partial<QuoteTable["Insert"]>;
  Relationships: [];
};

export type QuoteVersionTable = {
  Row: {
    accepted_at: string | null;
    apply_exchange_rate_margin: boolean;
    applies_isr_retention: boolean;
    applies_iva_retention: boolean;
    applies_iva_tax: boolean;
    created_at: string;
    discount_type: string;
    discount_value_mxn: number;
    display_currency: string;
    exchange_rate_margin_percent: number;
    exchange_rate_to_mxn: number;
    expires_at: string | null;
    id: string;
    isr_retention_mxn: number;
    isr_retention_rate_percent: number;
    items_total_mxn: number;
    iva_retention_mxn: number;
    iva_retention_rate_percent: number;
    iva_tax_mxn: number;
    contract_template_key: string;
    payment_plan_id: string | null;
    quote_id: string;
    questionnaire_template_key: string;
    sent_at: string | null;
    status: string;
    subtotal_mxn: number;
    tax_rate_percent: number;
    tax_total_mxn: number;
    total_mxn: number;
    updated_at: string;
    version_number: number;
  };
  Insert: {
    accepted_at?: string | null;
    apply_exchange_rate_margin?: boolean;
    applies_isr_retention?: boolean;
    applies_iva_retention?: boolean;
    applies_iva_tax?: boolean;
    created_at?: string;
    discount_type?: string;
    discount_value_mxn?: number;
    display_currency?: string;
    exchange_rate_margin_percent?: number;
    exchange_rate_to_mxn?: number;
    expires_at?: string | null;
    id?: string;
    isr_retention_mxn?: number;
    isr_retention_rate_percent?: number;
    items_total_mxn?: number;
    iva_retention_mxn?: number;
    iva_retention_rate_percent?: number;
    iva_tax_mxn?: number;
    contract_template_key?: string;
    payment_plan_id?: string | null;
    quote_id: string;
    questionnaire_template_key?: string;
    sent_at?: string | null;
    status?: string;
    subtotal_mxn?: number;
    tax_rate_percent?: number;
    tax_total_mxn?: number;
    total_mxn?: number;
    updated_at?: string;
    version_number: number;
  };
  Update: Partial<QuoteVersionTable["Insert"]>;
  Relationships: [];
};

export type QuoteItemTable = {
  Row: {
    cog_mxn: number;
    created_at: string;
    description: string;
    details: string;
    id: string;
    is_taxable: boolean;
    line_total_mxn: number;
    product_id: string | null;
    quantity: number;
    quote_version_id: string;
    sort_order: number;
    unit_price_mxn: number;
    updated_at: string;
  };
  Insert: {
    cog_mxn?: number;
    created_at?: string;
    description: string;
    details?: string;
    id?: string;
    is_taxable?: boolean;
    line_total_mxn?: number;
    product_id?: string | null;
    quantity?: number;
    quote_version_id: string;
    sort_order?: number;
    unit_price_mxn?: number;
    updated_at?: string;
  };
  Update: Partial<QuoteItemTable["Insert"]>;
  Relationships: [];
};

export type QuoteRecipientTable = {
  Row: {
    client_id: string | null;
    created_at: string;
    email: string;
    id: string;
    name: string;
    quote_id: string;
  };
  Insert: {
    client_id?: string | null;
    created_at?: string;
    email: string;
    id?: string;
    name: string;
    quote_id: string;
  };
  Update: Partial<QuoteRecipientTable["Insert"]>;
  Relationships: [];
};
