export type PayrollPaymentTable = {
  Row: {
    bonus_mxn: number;
    cash_currency: string | null;
    created_at: string;
    id: string;
    notes: string;
    paid_at: string;
    payment_method: string;
    receipt_file_url: string;
    receiving_account: string;
    sending_account: string;
    total_mxn: number;
    transaction_id: string;
    updated_at: string;
  };
  Insert: {
    bonus_mxn?: number;
    cash_currency?: string | null;
    created_at?: string;
    id?: string;
    notes?: string;
    paid_at?: string;
    payment_method: string;
    receipt_file_url?: string;
    receiving_account?: string;
    sending_account?: string;
    total_mxn?: number;
    transaction_id?: string;
    updated_at?: string;
  };
  Update: Partial<PayrollPaymentTable["Insert"]>;
  Relationships: [];
};

export type PayrollPaymentItemTable = {
  Row: {
    created_at: string;
    line_item_id: string;
    payment_id: string;
  };
  Insert: {
    created_at?: string;
    line_item_id: string;
    payment_id: string;
  };
  Update: Partial<PayrollPaymentItemTable["Insert"]>;
  Relationships: [];
};
