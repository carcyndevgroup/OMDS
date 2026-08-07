import type { StaffFormValues } from "../types/staff";
import { initialStaffFormValues } from "./staff-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof StaffFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

export function parseStaffFormValues(input: unknown): StaffFormValues {
  const source = isRecord(input) ? input : {};

  return {
    displayName: readString(source, "displayName"),
    address: readString(source, "address"),
    bankAccountNumber: readString(source, "bankAccountNumber"),
    bankBeneficiary: readString(source, "bankBeneficiary"),
    bankCardNumber: readString(source, "bankCardNumber"),
    bankClabe: readString(source, "bankClabe"),
    bankName: readString(source, "bankName"),
    dateOfBirth: readString(source, "dateOfBirth"),
    email: readString(source, "email"),
    idBackFileUrl: readString(source, "idBackFileUrl"),
    idExpirationDate: readString(source, "idExpirationDate"),
    idFrontFileUrl: readString(source, "idFrontFileUrl"),
    idNumber: readString(source, "idNumber"),
    idType: readString(source, "idType"),
    isActive:
      typeof source.isActive === "boolean"
        ? source.isActive
        : initialStaffFormValues.isActive,
    isDriver:
      typeof source.isDriver === "boolean"
        ? source.isDriver
        : initialStaffFormValues.isDriver,
    name: readString(source, "name"),
    notes: readString(source, "notes"),
    phone: readString(source, "phone"),
  };
}
