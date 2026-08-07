import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { listPublicPortalQuestionnaires } from "@/features/crm/portal/repositories/client-portal-repository";

type PublicQuestionnaireUploadRouteContext = {
  params: { accessKey: string; questionnaireId: string };
};

type UploadedQuestionnaireFile = {
  fileName: string;
  mimeType: string;
  path: string;
  sizeBytes: number;
  uploadedAt: string;
};

const BUCKET = "portal-questionnaire-uploads";
const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

const cleanPathSegment = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const safe = trimmed.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return safe || "field";
};

const cleanFileName = (fileName: string) => {
  const safe = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
  return safe || "upload.bin";
};

async function canAccessQuestionnaireUploads(accessKey: string, questionnaireId: string) {
  const database = await createServerSupabaseClient();
  const questionnaires = await listPublicPortalQuestionnaires(database, accessKey);
  const allowed = questionnaires.some((questionnaire) => questionnaire.id === questionnaireId);
  return { allowed, database };
}

export async function POST(
  request: Request,
  { params }: PublicQuestionnaireUploadRouteContext,
) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ code: "invalid_form_data" }, { status: 400 });
  }

  const fieldKey = formData.get("fieldKey");
  const file = formData.get("file");

  if (typeof fieldKey !== "string" || !fieldKey.trim()) {
    return NextResponse.json({ code: "invalid_field_key" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ code: "invalid_file" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ code: "invalid_file_size" }, { status: 400 });
  }

  const { allowed, database } = await canAccessQuestionnaireUploads(params.accessKey, params.questionnaireId);

  if (!allowed) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const safeField = cleanPathSegment(fieldKey);
  const safeName = cleanFileName(file.name);
  const filePath = `${params.accessKey}/${params.questionnaireId}/${safeField}/${Date.now()}-${safeName}`;

  const uploadResult = await database.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadResult.error) throw uploadResult.error;

  const signedUrlResult = await database.storage.from(BUCKET).createSignedUrl(filePath, 60 * 60 * 24 * 30);

  const payload: UploadedQuestionnaireFile = {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    path: filePath,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: payload, signedUrl: signedUrlResult.data?.signedUrl ?? null });
}

export async function DELETE(
  request: Request,
  { params }: PublicQuestionnaireUploadRouteContext,
) {
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

  const { allowed, database } = await canAccessQuestionnaireUploads(params.accessKey, params.questionnaireId);
  if (!allowed) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const result = await database.storage.from(BUCKET).remove([path]);
  if (result.error) throw result.error;

  return NextResponse.json({ ok: true });
}
