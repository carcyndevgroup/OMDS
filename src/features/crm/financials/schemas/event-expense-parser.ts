import type { EventExpenseFormValues } from "../types/event-expense";
import { initialEventExpenseValues } from "./event-expense-schema";

const read = (source: unknown, key: keyof EventExpenseFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseEventExpenseValues(source: unknown): EventExpenseFormValues {
  return {
    amountMxn: read(source, "amountMxn") || initialEventExpenseValues.amountMxn,
    categoryId: read(source, "categoryId"),
    description: read(source, "description"),
    notes: read(source, "notes"),
    status: (read(source, "status") || initialEventExpenseValues.status) as EventExpenseFormValues["status"],
    vendorName: read(source, "vendorName"),
  };
}
