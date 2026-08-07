import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { listPublicPortalQuestionnaires } from "@/features/crm/portal/repositories/client-portal-repository";

type PublicQuestionnaireUploadSignRouteContext = {
  params: Promise<{ accessKey: string; questionnaireId: string }>;
};

const BUCKET = "portal-questionnaire-uploads";

export async function POST(request: Request, props: PublicQuestionnaireUploadSignRouteContext) {
  const params = await props.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const path = typeof body === "object" && body !== null && "path" in body
    ? (body as { path?: unknown }).path
    : null;

  if (typeof path !== "string" || !path) {
    return NextResponse.json({ code: "invalid_path" }, { status: 400 });
  }

  const prefix = `${params.accessKey}/${params.questionnaireId}/`;
  if (!path.startsWith(prefix)) {
    return NextResponse.json({ code: "invalid_path" }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  const questionnaires = await listPublicPortalQuestionnaires(database, params.accessKey);
  const allowed = questionnaires.some((questionnaire) => questionnaire.id === params.questionnaireId);

  if (!allowed) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const signed = await database.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (signed.error) throw signed.error;

  return NextResponse.json({ signedUrl: signed.data.signedUrl });
}
