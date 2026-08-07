import type { StaffPosition, EventStaffFormValues } from "../types/staff";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof EventStaffFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

export function parseEventStaffFormValues(input: unknown): EventStaffFormValues {
  const source = isRecord(input) ? input : {};

  return {
    notes: readString(source, "notes"),
    position: readString(source, "position") as StaffPosition | "",
    staffMemberId: readString(source, "staffMemberId"),
  };
}
