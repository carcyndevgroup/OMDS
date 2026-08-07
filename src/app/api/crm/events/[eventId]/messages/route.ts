import { NextResponse } from "next/server";

import { createMessageDraftApiService } from "@/features/crm/messages/services/message-draft-api-service";
import type { MessageDraftCreateInput } from "@/features/crm/messages/types/message-draft";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type MessagesRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: MessagesRouteContext) {
  const service = await createMessageDraftApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: MessagesRouteContext) {
  const service = await createMessageDraftApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const payload = body as Partial<MessageDraftCreateInput>;
  if (
    typeof payload.subject !== "string"
    || !payload.subject.trim()
    || typeof payload.body !== "string"
  ) {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const created = await service.create(params.eventId, {
    body: payload.body,
    documentId: typeof payload.documentId === "string" ? payload.documentId : null,
    documentKind:
      payload.documentKind === "questionnaire"
      || payload.documentKind === "contract"
      || payload.documentKind === "invoice"
      || payload.documentKind === "quote"
      ? payload.documentKind
      : "general",
    metadata: payload.metadata ?? {},
    recipients: Array.isArray(payload.recipients) ? payload.recipients : [],
    status: payload.status === "sent" ? "sent" : "draft",
    subject: payload.subject,
  });

  await recordClientEventActivity(
    params.eventId,
    payload.status === "sent" ? "message_sent" : "message_created",
    payload.status === "sent" ? "Message sent" : "Message draft created",
  );

  return NextResponse.json({ data: created }, { status: 201 });
}
