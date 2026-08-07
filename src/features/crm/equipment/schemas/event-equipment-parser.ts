import type { EventEquipmentFormValues } from "../types/event-equipment";
import { initialEventEquipmentFormValues } from "./event-equipment-schema";

const readString = (source: unknown, key: keyof EventEquipmentFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseEventEquipmentFormValues(
  source: unknown,
): EventEquipmentFormValues {
  return {
    ...initialEventEquipmentFormValues,
    equipmentId: readString(source, "equipmentId"),
    notes: readString(source, "notes"),
  };
}
