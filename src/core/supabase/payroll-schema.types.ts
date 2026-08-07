export type PayrollTaskCatalogTable = {
  Row: {
    additional_unit_amount_mxn: number;
    base_amount_mxn: number;
    category: string;
    created_at: string;
    id: string;
    included_quantity: number;
    is_active: boolean;
    name: string;
    notes: string;
    overtime_rate_mxn: number;
    pay_rule: string;
    sort_order: number;
    task_key: string;
    unit_label: string;
    updated_at: string;
  };
  Insert: {
    additional_unit_amount_mxn?: number;
    base_amount_mxn?: number;
    category: string;
    created_at?: string;
    id?: string;
    included_quantity?: number;
    is_active?: boolean;
    name: string;
    notes?: string;
    overtime_rate_mxn?: number;
    pay_rule?: string;
    sort_order?: number;
    task_key: string;
    unit_label?: string;
    updated_at?: string;
  };
  Update: Partial<PayrollTaskCatalogTable["Insert"]>;
  Relationships: [];
};
