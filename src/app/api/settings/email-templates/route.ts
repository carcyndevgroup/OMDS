import { NextResponse } from "next/server";

import { parseEmailTemplateFormValues } from "@/features/settings/email-template/schemas/email-template-parser";
import { validateEmailTemplateForm } from "@/features/settings/email-template/schemas/email-template-schema";
import { createEmailTemplateApiService } from "@/features/settings/email-template/services/email-template-api-service";

export async function GET() {
  const service = await createEmailTemplateApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
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

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
