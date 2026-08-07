import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import type { Json } from "@/core/supabase/json.types";

type QuestionnaireUploadRow = {
  event_id: string;
  id: string;
  response_data: Json;
};

export async function getQuestionnaireUploadRow(
  database: SupabaseClient<Database>,
  eventId: string,
  questionnaireId: string,
): Promise<QuestionnaireUploadRow | null> {
  const result = await database
    .from("questionnaires")
    .select("id,event_id,response_data")
    .eq("id", questionnaireId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data;
}

export function responseHasAttachmentPath(responseData: Json, path: string) {
  const dynamicResponses = readDynamicResponses(responseData);

  return Object.values(dynamicResponses).some((value) => {
    if (!Array.isArray(value)) return false;

    return value.some((item) => {
      const record = asRecord(item);
      return typeof record.path === "string" && record.path === path;
    });
  });
}

export function removeAttachmentPathFromResponse(responseData: Json, path: string) {
  const root = asRecord(responseData);
  const dynamicResponses = asRecord(root.dynamicResponses);
  let removed = false;

  const nextDynamicResponses = Object.entries(dynamicResponses).reduce<Record<string, Json>>(
    (accumulator, [fieldKey, currentValue]) => {
      if (!Array.isArray(currentValue)) {
        accumulator[fieldKey] = currentValue as Json;
        return accumulator;
      }

      const nextArray = currentValue.filter((item) => {
        const record = asRecord(item);
        const currentPath = typeof record.path === "string" ? record.path : "";
        if (currentPath !== path) return true;

        removed = true;
        return false;
      }) as Json[];

      accumulator[fieldKey] = nextArray;
      return accumulator;
    },
    {},
  );

  if (!removed) {
    return { nextResponseData: responseData, removed: false };
  }

  const nextResponseData: Json = {
    ...root,
    dynamicResponses: nextDynamicResponses,
  };

  return { nextResponseData, removed: true };
}

function readDynamicResponses(responseData: Json) {
  const root = asRecord(responseData);
  return asRecord(root.dynamicResponses);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
