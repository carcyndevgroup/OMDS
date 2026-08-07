import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import {
  getQuestionnaireUploadRow,
  responseHasAttachmentPath,
} from "@/features/crm/questionnaire/repositories/questionnaire-upload-repository";

type UploadSignRouteContext = {
  params: { eventId: string; questionnaireId: string };
};

const BUCKET = "portal-questionnaire-uploads";

export async function POST(request: Request, { params }: UploadSignRouteContext) {
  const database = await createServerSupabaseClient();
  const {
    data: { user },
  } = await database.auth.getUser();

  if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const path =
    body && typeof body === "object"
      ? (body as { path?: unknown }).path
      : null;

  if (typeof path !== "string" || !path) {
    return NextResponse.json({ code: "invalid_path" }, { status: 400 });
  }

  const row = await getQuestionnaireUploadRow(database, params.eventId, params.questionnaireId);
  if (!row) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  if (!responseHasAttachmentPath(row.response_data, path)) {
    return NextResponse.json({ code: "invalid_path" }, { status: 400 });
  }

  const signed = await database.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (signed.error) throw signed.error;

  return NextResponse.json({ signedUrl: signed.data.signedUrl });
}
