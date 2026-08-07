export type PayrollPaymentBatchTable = {
  Row: {
    created_at: string;
    id: string;
    notes: string;
    scheduled_pay_date: string;
    status: string;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    notes?: string;
    scheduled_pay_date: string;
    status?: string;
    updated_at?: string;
  };
  Update: Partial<PayrollPaymentBatchTable["Insert"]>;
  Relationships: [];
};

export type PayrollPaymentBatchItemTable = {
  Row: {
    batch_id: string;
    created_at: string;
    line_item_id: string;
  };
  Insert: {
    batch_id: string;
    created_at?: string;
    line_item_id: string;
  };
  Update: Partial<PayrollPaymentBatchItemTable["Insert"]>;
  Relationships: [];
};
