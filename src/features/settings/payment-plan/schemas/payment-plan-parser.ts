import type {
  FinalDueRule,
  PaymentPlanFormValues,
  RetainerDueRule,
} from "../types/payment-plan";
import { initialPaymentPlanFormValues } from "./payment-plan-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof PaymentPlanFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

const readBoolean = (
  source: UnknownRecord,
  key: keyof PaymentPlanFormValues,
  fallback: boolean,
) => {
  return typeof source[key] === "boolean" ? (source[key] as boolean) : fallback;
};

export function parsePaymentPlanFormValues(input: unknown): PaymentPlanFormValues {
  const source = isRecord(input) ? input : {};

  return {
    allowAdjustedFinalBalance: readBoolean(
      source,
      "allowAdjustedFinalBalance",
      initialPaymentPlanFormValues.allowAdjustedFinalBalance,
    ),
    finalDueDaysBeforeEvent:
      readString(source, "finalDueDaysBeforeEvent") ||
      initialPaymentPlanFormValues.finalDueDaysBeforeEvent,
    finalDueRule:
      (readString(source, "finalDueRule") as FinalDueRule) ||
      initialPaymentPlanFormValues.finalDueRule,
    finalPaymentPercent:
      readString(source, "finalPaymentPercent") ||
      initialPaymentPlanFormValues.finalPaymentPercent,
    isActive: readBoolean(source, "isActive", initialPaymentPlanFormValues.isActive),
    isDefault: readBoolean(source, "isDefault", initialPaymentPlanFormValues.isDefault),
    name: readString(source, "name"),
    refundNotes: readString(source, "refundNotes"),
    retainerDueRule:
      (readString(source, "retainerDueRule") as RetainerDueRule) ||
      initialPaymentPlanFormValues.retainerDueRule,
    retainerGracePeriodDays:
      readString(source, "retainerGracePeriodDays") ||
      initialPaymentPlanFormValues.retainerGracePeriodDays,
    retainerPercent:
      readString(source, "retainerPercent") ||
      initialPaymentPlanFormValues.retainerPercent,
  };
}
