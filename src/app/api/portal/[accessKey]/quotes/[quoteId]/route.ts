import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { respondPublicPortalQuote } from "@/features/crm/portal/repositories/client-portal-repository";
import type { PublicPortalQuoteAction } from "@/features/crm/portal/types/client-portal";

type PublicQuoteRouteContext = {
  params: Promise<{ accessKey: string; quoteId: string }>;
};

const actions = new Set<PublicPortalQuoteAction>(["accept", "decline"]);

export async function PATCH(request: Request, props: PublicQuoteRouteContext) {
  const params = await props.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const action =
    body && typeof body === "object"
      ? (body as { action?: unknown }).action
      : null;

  if (typeof action !== "string" || !actions.has(action as PublicPortalQuoteAction)) {
    return NextResponse.json({ code: "invalid_action" }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  try {
    await respondPublicPortalQuote(
      database,
      params.accessKey,
      params.quoteId,
      action as PublicPortalQuoteAction,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("quote_expired")) {
      return NextResponse.json({ code: "quote_expired" }, { status: 409 });
    }

    throw error;
  }

  return NextResponse.json({ data: true });
}
