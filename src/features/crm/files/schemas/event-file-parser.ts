import type { EventFileFormValues } from "../types/event-file";
import { initialEventFileFormValues } from "./event-file-schema";

const readString = (source: unknown, key: keyof EventFileFormValues) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseEventFileFormValues(source: unknown): EventFileFormValues {
  const includeValue = source && typeof source === "object"
    ? (source as Record<string, unknown>).includeOnRunSheet
    : undefined;

  return {
    ...initialEventFileFormValues,
    fileName: readString(source, "fileName"),
    fileUrl: readString(source, "fileUrl"),
    includeOnRunSheet: typeof includeValue === "boolean" ? includeValue : true,
    notes: readString(source, "notes"),
  };
}
