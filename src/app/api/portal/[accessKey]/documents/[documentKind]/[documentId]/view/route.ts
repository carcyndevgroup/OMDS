import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { markPublicPortalDocumentViewed } from "@/features/crm/portal/repositories/client-portal-repository";

type DocumentKind = "contract" | "invoice" | "questionnaire" | "quote";

type PublicDocumentViewRouteContext = {
  params: {
    accessKey: string;
    documentId: string;
    documentKind: string;
  };
};

const allowedKinds = new Set<DocumentKind>(["contract", "invoice", "questionnaire", "quote"]);

export async function PATCH(_: Request, { params }: PublicDocumentViewRouteContext) {
  if (!allowedKinds.has(params.documentKind as DocumentKind)) {
    return NextResponse.json({ code: "invalid_document_kind" }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  await markPublicPortalDocumentViewed(
    database,
    params.accessKey,
    params.documentKind as DocumentKind,
    params.documentId,
  );

  return NextResponse.json({ data: true });
}
