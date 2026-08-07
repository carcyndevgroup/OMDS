import type { EquipmentCategory, EquipmentFormValues } from "../types/equipment";
import { initialEquipmentFormValues } from "./equipment-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof EquipmentFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

export function parseEquipmentFormValues(input: unknown): EquipmentFormValues {
  const source = isRecord(input) ? input : {};

  return {
    category: readString(source, "category") as EquipmentCategory | "",
    isActive:
      typeof source.isActive === "boolean"
        ? source.isActive
        : initialEquipmentFormValues.isActive,
    name: readString(source, "name"),
    notes: readString(source, "notes"),
  };
}
