export type ExpenseCategory = {
  id: string;
  isActive: boolean;
  name: string;
  sortOrder: string;
};

export type ExpenseCategoryFormValues = {
  isActive: boolean;
  name: string;
  sortOrder: string;
};
