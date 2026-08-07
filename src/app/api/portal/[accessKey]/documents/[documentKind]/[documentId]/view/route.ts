import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { markPublicPortalDocumentViewed } from "@/features/crm/portal/repositories/client-portal-repository";

type DocumentKind = "contract" | "invoice" | "questionnaire" | "quote";

type PublicDocumentViewRouteContext = {
  params: Promise<{
    accessKey: string;
    documentId: string;
    documentKind: string;
  }>;
};

const allowedKinds = new Set<DocumentKind>(["contract", "invoice", "questionnaire", "quote"]);

export async function PATCH(_: Request, props: PublicDocumentViewRouteContext) {
  const params = await props.params;
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
