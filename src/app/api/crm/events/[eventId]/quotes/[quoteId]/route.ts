import { NextResponse } from "next/server";

import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";
import type { QuoteWorkflowAction } from "@/features/crm/quote/types/quote";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type QuoteRouteContext = {
  params: Promise<{ eventId: string; quoteId: string }>;
};

const actions = new Set<QuoteWorkflowAction>([
  "accept",
  "decline",
  "expire",
  "revise",
  "send",
]);

export async function PATCH(request: Request, props: QuoteRouteContext) {
  const params = await props.params;
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

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

  if (typeof action !== "string" || !actions.has(action as QuoteWorkflowAction)) {
    return NextResponse.json({ code: "invalid_action" }, { status: 400 });
  }

  await service.workflow(
    params.eventId,
    params.quoteId,
    action as QuoteWorkflowAction,
  );
  await recordClientEventActivity(
    params.eventId,
    `quote_${action}`,
    `Quote ${action}`,
  );
  return NextResponse.json({ data: true });
}
