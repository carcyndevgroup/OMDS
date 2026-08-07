import { NextResponse } from "next/server";

import { parseEmailTemplateFormValues } from "@/features/settings/email-template/schemas/email-template-parser";
import { validateEmailTemplateForm } from "@/features/settings/email-template/schemas/email-template-schema";
import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";
import {
  DEFAULT_TEMPLATE_DELETE_FORBIDDEN,
  TEMPLATE_IN_USE_DELETE_FORBIDDEN,
} from "@/features/settings/email-template/repositories/email-template-repository";

type EmailTemplateRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: EmailTemplateRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const template = await service.find(params.id);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PUT(request: Request, props: EmailTemplateRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEmailTemplateFormValues(body);
  const validation = validateEmailTemplateForm(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  const template = await service.update(params.id, values);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PATCH(request: Request, props: EmailTemplateRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const isActive =
    typeof body === "object" && body !== null && "isActive" in body
      ? (body as { isActive?: unknown }).isActive
      : undefined;

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const template = await service.setActive(params.id, isActive);
  return template ? NextResponse.json({ data: template }) : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function DELETE(_: Request, props: EmailTemplateRouteContext) {
  const params = await props.params;
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  try {
    await service.delete(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? (error as { code?: unknown }).code : null;
    if (code === DEFAULT_TEMPLATE_DELETE_FORBIDDEN) {
      return NextResponse.json({ code: DEFAULT_TEMPLATE_DELETE_FORBIDDEN }, { status: 409 });
    }
    if (code === TEMPLATE_IN_USE_DELETE_FORBIDDEN) {
      return NextResponse.json({ code: TEMPLATE_IN_USE_DELETE_FORBIDDEN }, { status: 409 });
    }
    throw error;
  }
}
