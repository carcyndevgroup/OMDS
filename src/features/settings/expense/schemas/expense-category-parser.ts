import type { ExpenseCategoryFormValues } from "../types/expense-category";
import { initialExpenseCategoryValues } from "./expense-category-schema";

const read = (source: unknown, key: keyof ExpenseCategoryFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseExpenseCategoryValues(
  source: unknown,
): ExpenseCategoryFormValues {
  const active = source && typeof source === "object"
    ? (source as Record<string, unknown>).isActive
    : true;

  return {
    isActive: typeof active === "boolean" ? active : true,
    name: read(source, "name"),
    sortOrder: read(source, "sortOrder") || initialExpenseCategoryValues.sortOrder,
  };
}
