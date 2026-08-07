import type { EventPlannerFormValues } from "../types/event-planner";
import { initialEventPlannerFormValues } from "./event-planner-schema";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export function parseEventPlannerFormValues(input: unknown): EventPlannerFormValues {
  if (!input || typeof input !== "object") return initialEventPlannerFormValues;

  const source = input as Record<string, unknown>;
  return {
    commissionEligible: source.commissionEligible !== false,
    commissionPercentageOverride: asString(source.commissionPercentageOverride),
    isPrimary: source.isPrimary !== false,
    notes: asString(source.notes),
    plannerId: asString(source.plannerId),
    role: asString(source.role) || "primary_planner",
  };
}
