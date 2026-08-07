import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import {
  getQuestionnaireUploadRow,
  removeAttachmentPathFromResponse,
} from "@/features/crm/questionnaire/repositories/questionnaire-upload-repository";

type UploadDeleteRouteContext = {
  params: { eventId: string; questionnaireId: string };
};

const BUCKET = "portal-questionnaire-uploads";

export async function DELETE(request: Request, { params }: UploadDeleteRouteContext) {
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

  const { nextResponseData, removed } = removeAttachmentPathFromResponse(row.response_data, path);
  if (!removed) {
    return NextResponse.json({ code: "invalid_path" }, { status: 400 });
  }

  const storageDelete = await database.storage.from(BUCKET).remove([path]);
  if (storageDelete.error) throw storageDelete.error;

  const update = await database
    .from("questionnaires")
    .update({ response_data: nextResponseData })
    .eq("id", row.id)
    .eq("event_id", row.event_id)
    .select("id")
    .single();

  if (update.error) throw update.error;

  return NextResponse.json({ data: true });
}
