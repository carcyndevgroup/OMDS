export type EventStaffAssignmentTable = {
  Row: {
    created_at: string;
    event_id: string;
    id: string;
    notes: string;
    position: string;
    staff_member_id: string;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    event_id: string;
    id?: string;
    notes?: string;
    position: string;
    staff_member_id: string;
    updated_at?: string;
  };
  Update: Partial<EventStaffAssignmentTable["Insert"]>;
  Relationships: [];
};

export type EventStaffPayrollTable = {
  Row: {
    amount_mxn: number;
    created_at: string;
    event_id: string;
    event_staff_assignment_id: string;
    id: string;
    notes: string;
    status: string;
    updated_at: string;
  };
  Insert: {
    amount_mxn?: number;
    created_at?: string;
    event_id: string;
    event_staff_assignment_id: string;
    id?: string;
    notes?: string;
    status?: string;
    updated_at?: string;
  };
  Update: Partial<EventStaffPayrollTable["Insert"]>;
  Relationships: [];
};

export type ExpenseCategoryTable = {
  Row: {
    created_at: string;
    id: string;
    is_active: boolean;
    name: string;
    sort_order: number;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    is_active?: boolean;
    name: string;
    sort_order?: number;
    updated_at?: string;
  };
  Update: Partial<ExpenseCategoryTable["Insert"]>;
  Relationships: [];
};

export type EventExpenseTable = {
  Row: {
    amount_mxn: number;
    created_at: string;
    description: string;
    event_id: string;
    expense_category_id: string | null;
    id: string;
    notes: string;
    status: string;
    updated_at: string;
    vendor_name: string;
  };
  Insert: {
    amount_mxn?: number;
    created_at?: string;
    description: string;
    event_id: string;
    expense_category_id?: string | null;
    id?: string;
    notes?: string;
    status?: string;
    updated_at?: string;
    vendor_name?: string;
  };
  Update: Partial<EventExpenseTable["Insert"]>;
  Relationships: [];
};

export type EventEquipmentAssignmentTable = {
  Row: {
    created_at: string;
    equipment_id: string;
    event_id: string;
    id: string;
    notes: string;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    equipment_id: string;
    event_id: string;
    id?: string;
    notes?: string;
    updated_at?: string;
  };
  Update: Partial<EventEquipmentAssignmentTable["Insert"]>;
  Relationships: [];
};

export type EventFileTable = {
  Row: {
    created_at: string;
    event_id: string;
    file_name: string;
    file_url: string;
    id: string;
    include_on_run_sheet: boolean;
    notes: string;
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    event_id: string;
    file_name: string;
    file_url: string;
    id?: string;
    include_on_run_sheet?: boolean;
    notes?: string;
    updated_at?: string;
  };
  Update: Partial<EventFileTable["Insert"]>;
  Relationships: [];
};

export type EquipmentCatalogTable = {
  Row: {
    category: string;
    created_at: string;
    id: string;
    is_active: boolean;
    name: string;
    notes: string;
    updated_at: string;
  };
  Insert: {
    category: string;
    created_at?: string;
    id?: string;
    is_active?: boolean;
    name: string;
    notes?: string;
    updated_at?: string;
  };
  Update: Partial<EquipmentCatalogTable["Insert"]>;
  Relationships: [];
};

export type ProductCatalogTable = {
  Row: {
    category: string;
    cog_mxn: number;
    created_at: string;
    description: string;
    family: string;
    id: string;
    is_active: boolean;
    is_taxable: boolean;
    name: string;
    notes: string;
    price_mxn: number;
    updated_at: string;
  };
  Insert: {
    category: string;
    cog_mxn?: number;
    created_at?: string;
    description?: string;
    family?: string;
    id?: string;
    is_active?: boolean;
    is_taxable?: boolean;
    name: string;
    notes?: string;
    price_mxn?: number;
    updated_at?: string;
  };
  Update: Partial<ProductCatalogTable["Insert"]>;
  Relationships: [];
};
