export type EventExpenseStatus = "approved" | "estimated" | "paid" | "void";

export type EventExpense = {
  amountMxn: string;
  categoryId: string;
  categoryName: string;
  description: string;
  id: string;
  notes: string;
  status: EventExpenseStatus;
  vendorName: string;
};

export type EventExpenseFormValues = {
  amountMxn: string;
  categoryId: string;
  description: string;
  notes: string;
  status: EventExpenseStatus;
  vendorName: string;
};
