import { NextResponse } from "next/server";

import { createQuestionnaireApiService } from "@/features/crm/questionnaire/services/questionnaire-api-service";
import type { QuestionnaireAction } from "@/features/crm/questionnaire/types/questionnaire";

type QuestionnaireRouteContext = {
  params: Promise<{ eventId: string; questionnaireId: string }>;
};

const actions = new Set<QuestionnaireAction>([
  "apply_approved",
  "approve_review",
  "reject_review",
  "send",
  "submit",
]);

export async function PATCH(request: Request, props: QuestionnaireRouteContext) {
  const params = await props.params;
  const service = await createQuestionnaireApiService();
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
  const reviewNotes =
    body && typeof body === "object"
      ? (body as { reviewNotes?: unknown }).reviewNotes
      : "";
  const clientId =
    body && typeof body === "object"
      ? (body as { clientId?: unknown }).clientId
      : null;

  if (typeof action !== "string" || !actions.has(action as QuestionnaireAction)) {
    return NextResponse.json({ code: "invalid_action" }, { status: 400 });
  }

  if (action === "apply_approved") {
    await service.applyApproved(
      params.questionnaireId,
      typeof clientId === "string" ? clientId : undefined,
    );
  }
  if (action === "send") await service.send(params.questionnaireId);
  if (action === "submit") await service.submit(params.questionnaireId);
  if (action === "approve_review") {
    await service.review(
      params.questionnaireId,
      "approved",
      typeof reviewNotes === "string" ? reviewNotes : "",
    );
  }
  if (action === "reject_review") {
    await service.review(
      params.questionnaireId,
      "rejected",
      typeof reviewNotes === "string" ? reviewNotes : "",
    );
  }

  return NextResponse.json({ data: true });
}
