import { NextResponse } from "next/server";

import { renderContractPdfText } from "@/features/crm/shared/documents/contract-content-renderer";
import { createContractPdfDocument } from "@/features/crm/shared/pdf/document-pdf";
import { buildContractPreviewPayload } from "@/features/settings/contract-template/utils/contract-template-preview";

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const body = typeof payload.body === "string" ? payload.body : "";
  const issuedAt = typeof payload.issuedAt === "string" ? payload.issuedAt : null;
  const status = typeof payload.status === "string" ? payload.status : "sent";
  const title = typeof payload.title === "string" ? payload.title : "Contract";
  const companyProfile = payload.companyProfile && typeof payload.companyProfile === "object"
    ? payload.companyProfile as Record<string, unknown>
    : undefined;

  const previewPayload = buildContractPreviewPayload({
    body,
    companyProfile: companyProfile ? {
      address: typeof companyProfile.address === "string" ? companyProfile.address : undefined,
      dbaName: typeof companyProfile.dbaName === "string" ? companyProfile.dbaName : undefined,
      email: typeof companyProfile.email === "string" ? companyProfile.email : undefined,
      legalName: typeof companyProfile.legalName === "string" ? companyProfile.legalName : undefined,
      phone: typeof companyProfile.phone === "string" ? companyProfile.phone : undefined,
      website: typeof companyProfile.website === "string" ? companyProfile.website : undefined,
    } : undefined,
    issuedAt,
    status,
    title,
  });
  const previewBody = renderContractPdfText(previewPayload.body);
  const bytes = await createContractPdfDocument({
    body: previewBody,
    companyProfile: {
      address: companyProfile?.address && typeof companyProfile.address === "string" ? companyProfile.address : undefined,
      dbaName: companyProfile?.dbaName && typeof companyProfile.dbaName === "string" ? companyProfile.dbaName : undefined,
      email: companyProfile?.email && typeof companyProfile.email === "string" ? companyProfile.email : undefined,
      legalName: companyProfile?.legalName && typeof companyProfile.legalName === "string" ? companyProfile.legalName : undefined,
      phone: companyProfile?.phone && typeof companyProfile.phone === "string" ? companyProfile.phone : undefined,
      website: companyProfile?.website && typeof companyProfile.website === "string" ? companyProfile.website : undefined,
    },
    issuedAt,
    status,
    title,
  });
  const normalizedBytes = Uint8Array.from(bytes);
  const responseBody = new Blob([normalizedBytes.buffer], { type: "application/pdf" });

  return new NextResponse(responseBody, {
    headers: {
      "Content-Disposition": `attachment; filename=\"${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "contract"}.pdf\"`,
      "Content-Type": "application/pdf",
    },
    status: 200,
  });
}
