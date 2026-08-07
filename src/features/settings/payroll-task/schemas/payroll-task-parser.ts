import type { PayrollTaskFormValues } from "../types/payroll-task";
import { initialPayrollTaskFormValues } from "./payroll-task-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (source: UnknownRecord, key: keyof PayrollTaskFormValues) =>
  typeof source[key] === "string" ? (source[key] as string) : "";

export function parsePayrollTaskValues(input: unknown): PayrollTaskFormValues {
  const source = isRecord(input) ? input : {};

  return {
    additionalUnitAmountMxn: readString(source, "additionalUnitAmountMxn"),
    baseAmountMxn: readString(source, "baseAmountMxn"),
    category: readString(source, "category") as PayrollTaskFormValues["category"],
    includedQuantity: readString(source, "includedQuantity"),
    isActive:
      typeof source.isActive === "boolean"
        ? source.isActive
        : initialPayrollTaskFormValues.isActive,
    name: readString(source, "name"),
    notes: readString(source, "notes"),
    overtimeRateMxn: readString(source, "overtimeRateMxn"),
    payRule: readString(source, "payRule") as PayrollTaskFormValues["payRule"],
    sortOrder: readString(source, "sortOrder"),
    taskKey: readString(source, "taskKey"),
    unitLabel: readString(source, "unitLabel"),
  };
}
