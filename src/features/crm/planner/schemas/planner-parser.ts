import type { PlannerFormValues } from "../types/planner";
import { initialPlannerFormValues } from "./planner-schema";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export function parsePlannerFormValues(input: unknown): PlannerFormValues {
  if (!input || typeof input !== "object") return initialPlannerFormValues;

  const source = input as Record<string, unknown>;
  return {
    area: asString(source.area),
    city: asString(source.city),
    companyName: asString(source.companyName),
    defaultCommissionModel: asString(source.defaultCommissionModel),
    defaultCommissionPercentage: asString(source.defaultCommissionPercentage),
    email: asString(source.email),
    instagram: asString(source.instagram),
    internalStatus: source.internalStatus === "inactive" ? "inactive" : "active",
    name: asString(source.name),
    notes: asString(source.notes),
    phone: asString(source.phone),
    preferredContactMethod: asString(source.preferredContactMethod) || "email",
    pvCommissionPolicy: asString(source.pvCommissionPolicy),
    websiteUrl: asString(source.websiteUrl),
    whatsapp: asString(source.whatsapp),
  };
}
