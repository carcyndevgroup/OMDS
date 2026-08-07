import type { ProductCategory, ProductFormValues } from "../types/product";
import { initialProductFormValues } from "./product-schema";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (source: UnknownRecord, key: keyof ProductFormValues) => {
  return typeof source[key] === "string" ? (source[key] as string) : "";
};

const readBoolean = (source: UnknownRecord, key: keyof ProductFormValues) => {
  return typeof source[key] === "boolean"
    ? (source[key] as boolean)
    : initialProductFormValues[key];
};

export function parseProductFormValues(input: unknown): ProductFormValues {
  const source = isRecord(input) ? input : {};

  return {
    category: readString(source, "category") as ProductCategory | "",
    cogMxn: readString(source, "cogMxn"),
    description: readString(source, "description"),
    family: readString(source, "family"),
    isActive: readBoolean(source, "isActive") as boolean,
    isTaxable: readBoolean(source, "isTaxable") as boolean,
    name: readString(source, "name"),
    notes: readString(source, "notes"),
    priceMxn: readString(source, "priceMxn"),
  };
}
