import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import type { Json } from "@/core/supabase/json.types";
import { savePublicPortalQuestionnaireProgress } from "@/features/crm/portal/repositories/client-portal-repository";
import { submitPublicPortalQuestionnaire } from "@/features/crm/portal/repositories/client-portal-repository";

type PublicQuestionnaireRouteContext = {
  params: Promise<{ accessKey: string; questionnaireId: string }>;
};

const isRecord = (value: unknown): value is Record<string, Json> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

export async function PATCH(request: Request, props: PublicQuestionnaireRouteContext) {
  const params = await props.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const responseData = isRecord(body)
    ? (body as { responseData?: unknown }).responseData
    : null;
  const action = isRecord(body)
    ? (body as { action?: unknown }).action
    : "submit";

  if (!isRecord(responseData)) {
    return NextResponse.json({ code: "invalid_response_data" }, { status: 400 });
  }

  if (action !== "save" && action !== "submit") {
    return NextResponse.json({ code: "invalid_action" }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  if (action === "save") {
    await savePublicPortalQuestionnaireProgress(
      database,
      params.accessKey,
      params.questionnaireId,
      responseData,
    );
  } else {
    await submitPublicPortalQuestionnaire(
      database,
      params.accessKey,
      params.questionnaireId,
      responseData,
    );
  }

  return NextResponse.json({ data: true });
}
