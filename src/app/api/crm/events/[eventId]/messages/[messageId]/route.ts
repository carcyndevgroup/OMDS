import { NextResponse } from "next/server";

import { createMessageDraftApiService } from "@/features/crm/messages/services/message-draft-api-service";
import type { MessageDraftStatus } from "@/features/crm/messages/types/message-draft";

type MessageRouteContext = { params: Promise<{ eventId: string; messageId: string }> };

export async function PATCH(request: Request, props: MessageRouteContext) {
  const params = await props.params;
  const service = await createMessageDraftApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const status =
    body && typeof body === "object"
      ? (body as { status?: unknown }).status
      : null;

  if (status !== "draft" && status !== "sent") {
    return NextResponse.json({ code: "invalid_status" }, { status: 400 });
  }

  const updated = await service.updateStatus(
    params.eventId,
    params.messageId,
    status as MessageDraftStatus,
  );
  return NextResponse.json({ data: updated });
}
