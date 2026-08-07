import { renderTemplatePreview } from "@/features/settings/template-tools/template-token-catalog";

type ContractPreviewPayload = {
  body: string;
  issuedAt: string | null;
  status: string;
  title: string;
};

type CompanyProfileContext = {
  address?: string;
  dbaName?: string;
  email?: string;
  legalName?: string;
  phone?: string;
  website?: string;
};

type ContractPreviewInput = {
  body: string;
  bookingType?: string;
  companyProfile?: CompanyProfileContext;
  eventType?: string;
  issuedAt?: string | null;
  status?: string;
  title?: string;
};

export function buildContractPreviewPayload(input: ContractPreviewInput): ContractPreviewPayload {
  const renderedBody = renderTemplatePreview(input.body, {
    bookingType: input.bookingType,
    documentKind: "contract",
    eventType: input.eventType,
  }, {
    "company.address": input.companyProfile?.address ?? "",
    "company.dbaName": input.companyProfile?.dbaName ?? "",
    "company.email": input.companyProfile?.email ?? "",
    "company.legalName": input.companyProfile?.legalName ?? "",
    "company.phone": input.companyProfile?.phone ?? "",
    "company.website": input.companyProfile?.website ?? "",
  });

  return {
    body: renderedBody,
    issuedAt: input.issuedAt ?? null,
    status: input.status ?? "sent",
    title: input.title?.trim() || "Contract",
  };
}

export function toPlainTextContractBody(value: string) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "\n\n")
    .replace(/<\/?h[1-6]>/gi, "\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<\/?ul>/gi, "\n")
    .replace(/<\/?ol>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
