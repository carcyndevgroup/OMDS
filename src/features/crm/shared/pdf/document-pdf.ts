import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Json } from "@/core/supabase/json.types";
import type { Invoice } from "@/features/crm/invoice/types/invoice";
import type { QuoteSummary, QuoteVersion } from "@/features/crm/quote/types/quote";
import { formatQuoteMoney } from "../../quote/utils/quote-money";

import { renderHtmlToPdf } from "./playwright-pdf";
import { buildContractPdfHtml, normalizeContractBodyHtml } from "./contract-pdf-shell";

export async function createQuotePdfDocument(
  quote: QuoteSummary,
  version: QuoteVersion,
  companyProfile?: {
    address?: string;
    dbaName?: string;
    email?: string;
    legalName?: string;
    phone?: string;
    website?: string;
  },
) {
  const logoDataUri = await getBrandingLogoDataUri();
  const companyName = companyProfile?.dbaName || companyProfile?.legalName || "Oh My Desserts & Snacks";
  const companyDetails = [companyProfile?.address, companyProfile?.email, companyProfile?.phone, companyProfile?.website].filter((value): value is string => Boolean(value)).map(escapeHtml).join("<br />");
  const brandMarkup = logoDataUri ? `<img class="brand-mark" src="${logoDataUri}" alt="${escapeHtml(companyName)}" />` : `<div class="brand">${escapeHtml(companyName)}</div>`;
  const recipient = quote.recipients[0];
  const exchangeRate = getEffectiveQuoteExchangeRate(version);
  const exchangeRateMarkup = version.displayCurrency === "mxn" || exchangeRate <= 0
    ? ""
    : `<div class="rate">Exchange rate used: 1 ${escapeHtml(version.displayCurrency.toUpperCase())} = MXN ${exchangeRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>`;
  const rows = version.items.map((item) => `<tr><td><strong>${escapeHtml(item.description)}</strong>${item.details ? `<small>${escapeHtml(item.details)}</small>` : ""}</td><td class="right">${escapeHtml(item.quantity)}</td><td class="right">${escapeHtml(formatQuoteMoney(item.lineTotalMxn, version))}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>@page{margin:10mm}*{box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;margin:0;padding:10px;color:#27303b;background:#fff}.page{min-height:277mm;border:1px solid #fff;padding:30px 34px;background:#fffdf8}.top{display:flex;justify-content:space-between;gap:28px;border-bottom:1px solid #e7dccb;padding-bottom:22px}.brand-mark{max-height:52px;width:auto;max-width:190px}.brand{font-size:16px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#725d45}.company{font-size:10px;line-height:1.6;color:#7c746b;text-align:right}.title{margin:28px 0 5px;font-size:30px;letter-spacing:.08em;text-transform:uppercase;color:#17202a}.subtitle{font-size:12px;color:#8b8176}.recipient{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:26px 0;padding:16px 0;border-top:1px solid #eee6da;border-bottom:1px solid #eee6da}.label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9b8060}.value{margin-top:6px;font-size:14px;color:#202a34}.table{width:100%;border-collapse:collapse;margin-top:24px;font-size:12px}.table th{padding:10px 8px;border-bottom:2px solid #bda98b;text-align:left;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#806b50}.table td{padding:13px 8px;border-bottom:1px solid #eee6da;vertical-align:top}.table small{display:block;margin-top:5px;color:#8b8176;line-height:1.4}.right{text-align:right}.totals{margin:25px 0 0 auto;width:290px;border-top:1px solid #bda98b;padding-top:12px}.total{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#756b60}.grand{margin-top:8px;border-top:1px solid #e7dccb;padding-top:12px;font-size:18px;font-weight:700;color:#9a6f50}.rate{margin-top:9px;font-size:10px;line-height:1.4;color:#8b8176;text-align:right}.footer{margin-top:38px;padding-top:15px;border-top:1px solid #eee6da;font-size:10px;line-height:1.6;color:#8b8176}</style></head><body><main class="page"><header class="top"><div>${brandMarkup}</div><div class="company">${companyDetails}</div></header><h1 class="title">Quote</h1><div class="subtitle">${escapeHtml(quote.title)} &bull; Version ${escapeHtml(String(version.versionNumber))}</div><section class="recipient"><div><div class="label">Prepared for</div><div class="value">${escapeHtml(recipient?.name || "Client")}</div>${recipient?.email ? `<div class="subtitle">${escapeHtml(recipient.email)}</div>` : ""}</div><div><div class="label">Valid through</div><div class="value">${escapeHtml(version.expiresAt || "To be confirmed")}</div></div></section><table class="table"><thead><tr><th>Description</th><th class="right">Quantity</th><th class="right">Amount (${escapeHtml(version.displayCurrency.toUpperCase())})</th></tr></thead><tbody>${rows}</tbody></table><section class="totals"><div class="total"><span>Subtotal</span><span>${escapeHtml(formatQuoteMoney(version.subtotalMxn, version))}</span></div>${version.appliesIvaTax ? `<div class="total"><span>IVA</span><span>${escapeHtml(formatQuoteMoney(version.ivaTaxMxn, version))}</span></div>` : ""}<div class="total grand"><span>Total</span><span>${escapeHtml(formatQuoteMoney(version.totalMxn, version))}</span></div>${exchangeRateMarkup}</section><footer class="footer">All quoted prices and payments are stated in MXN. ${version.displayCurrency === "mxn" ? "" : `Amounts shown in ${escapeHtml(version.displayCurrency.toUpperCase())} are converted references using the exchange rate above.`} This quote is prepared by ${escapeHtml(companyName)}.</footer></main></body></html>`;

  return renderHtmlToPdf(html);
}

function getEffectiveQuoteExchangeRate(version: QuoteVersion) {
  const baseRate = Number(version.exchangeRateToMxn);
  if (!Number.isFinite(baseRate) || baseRate <= 0) return 0;
  const margin = version.applyExchangeRateMargin ? Number(version.exchangeRateMarginPercent) / 100 : 0;
  return baseRate * Math.max(1 - (Number.isFinite(margin) ? margin : 0), 0.01);
}

export async function createInvoicePdfDocument(invoice: Invoice, companyProfile?: {
  address?: string;
  dbaName?: string;
  email?: string;
  legalName?: string;
  phone?: string;
  website?: string;
}) {
  const logoDataUri = await getBrandingLogoDataUri();
  const companyName = companyProfile?.dbaName || companyProfile?.legalName || "Oh My Desserts & Snacks";
  const companyDetails = [companyProfile?.address, companyProfile?.email, companyProfile?.phone, companyProfile?.website].filter((value): value is string => Boolean(value)).map(escapeHtml).join("<br />");
  const brandMarkup = logoDataUri ? `<img class="brand-mark" src="${logoDataUri}" alt="${escapeHtml(companyName)}" />` : `<div class="brand">${escapeHtml(companyName)}</div>`;
  const formatMoney = (value: string) => `${invoice.displayCurrency.toUpperCase()} ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))}`;
  const rows = invoice.items.map((item) => `<tr><td><strong>${escapeHtml(item.description)}</strong>${item.details ? `<small>${escapeHtml(item.details)}</small>` : ""}</td><td class="right">${escapeHtml(item.quantity)}</td><td class="right">${escapeHtml(formatMoney(item.lineTotalMxn))}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>@page{margin:10mm}*{box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;margin:0;padding:10px;color:#27303b;background:#fff}.page{min-height:277mm;border:1px solid #fff;padding:30px 34px;background:#fffdf8}.top{display:flex;justify-content:space-between;gap:28px;border-bottom:1px solid #e7dccb;padding-bottom:22px}.brand-mark{max-height:52px;width:auto;max-width:190px}.brand{font-size:16px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#725d45}.company{font-size:10px;line-height:1.6;color:#7c746b;text-align:right}.title{margin:28px 0 5px;font-size:30px;letter-spacing:.08em;text-transform:uppercase;color:#17202a}.subtitle{font-size:12px;color:#8b8176}.recipient{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:26px 0;padding:16px 0;border-top:1px solid #eee6da;border-bottom:1px solid #eee6da}.label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9b8060}.value{margin-top:6px;font-size:14px;color:#202a34}.table{width:100%;border-collapse:collapse;margin-top:24px;font-size:12px}.table th{padding:10px 8px;border-bottom:2px solid #bda98b;text-align:left;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#806b50}.table td{padding:13px 8px;border-bottom:1px solid #eee6da;vertical-align:top}.table small{display:block;margin-top:5px;color:#8b8176;line-height:1.4}.right{text-align:right}.totals{margin:25px 0 0 auto;width:290px;border-top:1px solid #bda98b;padding-top:12px}.total{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#756b60}.grand{margin-top:8px;border-top:1px solid #e7dccb;padding-top:12px;font-size:18px;font-weight:700;color:#9a6f50}.footer{margin-top:38px;padding-top:15px;border-top:1px solid #eee6da;font-size:10px;line-height:1.6;color:#8b8176}</style></head><body><main class="page"><header class="top"><div>${brandMarkup}</div><div class="company">${companyDetails}</div></header><h1 class="title">Invoice</h1><div class="subtitle">${escapeHtml(invoice.id.slice(0, 8).toUpperCase())}</div><section class="recipient"><div><div class="label">Status</div><div class="value">${escapeHtml(invoice.status.replace("_", " "))}</div></div><div><div class="label">Due date</div><div class="value">${escapeHtml(invoice.dueAt || "To be confirmed")}</div></div></section><table class="table"><thead><tr><th>Description</th><th class="right">Quantity</th><th class="right">Amount (${escapeHtml(invoice.displayCurrency.toUpperCase())})</th></tr></thead><tbody>${rows}</tbody></table><section class="totals"><div class="total"><span>Subtotal</span><span>${escapeHtml(formatMoney(invoice.subtotalMxn))}</span></div><div class="total"><span>Tax</span><span>${escapeHtml(formatMoney(invoice.taxTotalMxn))}</span></div><div class="total grand"><span>Total</span><span>${escapeHtml(formatMoney(invoice.totalMxn))}</span></div></section><footer class="footer">All quoted prices and payments are stated in MXN. This invoice is prepared by ${escapeHtml(companyName)}.</footer></main></body></html>`;

  return renderHtmlToPdf(html);
}

export async function createContractPdfDocument(input: {
  body: string;
  clientAddress?: string | null;
  clientName?: string | null;
  contractId?: string | null;
  companyProfile?: {
    address?: string;
    dbaName?: string;
    email?: string;
    legalName?: string;
    phone?: string;
    website?: string;
  };
  issuedAt: string | null;
  signerFullName?: string | null;
  signerTitle?: string | null;
  status: string;
  title: string;
  tokenOverrides?: Record<string, string>;
  venueName?: string | null;
  auditTrail?: Array<{ at: string; event: string; source?: string }>;
  signingMetadata?: {
    authenticationMethod?: string;
    documentHash?: string;
    ipAddress?: string | null;
    signedAt?: string;
    userAgent?: string | null;
  };
}) {
  const logoDataUri = await getBrandingLogoDataUri();

  // Apply token overrides to the body before building the PDF shell.
  let resolvedBody = input.body;
  if (input.tokenOverrides?.["financials.retainer_usd"] === "") {
    resolvedBody = resolvedBody
      .replace(/\*\$\{\{\s*financials\.retainer_usd\s*\}\}\*/gi, "")
      .replace(/\*\$\{\{\s*financials\.balance_usd\s*\}\}\*/gi, "");
  }
  if (input.tokenOverrides && Object.keys(input.tokenOverrides).length > 0) {
    resolvedBody = resolvedBody.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_match, key: string) => {
      return input.tokenOverrides![key.trim()] ?? _match;
    });
  }
  resolvedBody = removeUnusedItemRows(resolvedBody);

  const eventDateLabel = input.issuedAt
    ? new Date(input.issuedAt).toLocaleDateString("en-US", { timeZone: "UTC" })
    : "—";
  const contractIdShort = input.contractId ? input.contractId.slice(0, 8).toUpperCase() : "—";
  const clientLabel = input.clientName?.trim() || "Client";

  const html = buildContractPdfHtml({
    bodyHtml: normalizeContractBodyHtml(resolvedBody),
    clientAddress: input.clientAddress?.trim() || undefined,
    clientName: clientLabel,
    contractId: contractIdShort,
    documentTitle: input.title,
    eventDateLabel,
    logoSrc: logoDataUri,
    omdsAddress: input.companyProfile?.address || "Jardines Del Sur II, Cancún, Q.R., 77535",
    omdsDbaName: input.companyProfile?.dbaName || "Oh My Desserts & Snacks MX",
    omdsName: input.companyProfile?.legalName || "Oh My Desserts & Snacks MX",
    signature: {
      omdsSignedName: input.signerFullName || undefined,
      omdsSignedTitle: input.signerTitle || undefined,
    },
    auditTrail: input.auditTrail,
    signingMetadata: input.signingMetadata,
    venueName: input.venueName?.trim() || undefined,
  });

  // Playwright footer renders "Page X of Y" at the bottom of every page.
  // The footer template uses Chromium's .pageNumber / .totalPages classes.
  const footerHtml = `<div style="font-family:Georgia,'Times New Roman',serif;font-size:8pt;color:#6c625b;width:100%;text-align:center;padding-bottom:4px">${escapeHtml(clientLabel)} \u2022 ${escapeHtml(eventDateLabel)} \u2022 ${escapeHtml(contractIdShort)} &nbsp;&bull;&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`;

  return renderHtmlToPdf(html, { footerHtml });
}

function removeUnusedItemRows(body: string) {
  return body.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (row) => {
    const hasUnresolvedSecondItemToken = /{{\s*item\.(?:name|desc|qty|unit|total)_2\s*}}/i.test(row);
    return hasUnresolvedSecondItemToken ? "" : row;
  });
}

export async function createQuestionnairePdfDocument(input: {
  responseData: Json;
  submittedAt: string | null;
  title: string;
}) {
  const logoDataUri = await getBrandingLogoDataUri();
  const brandMarkup = logoDataUri ? `<img class="brand-mark" src="${logoDataUri}" alt="Oh My Desserts & Snacks logo" />` : `<div class="brand">Oh My Desserts &amp; Snacks</div>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>@page{margin:18mm}body{font-family:Georgia,serif;margin:0;padding:24px 28px;color:#1f2937;background:#fcfaf6} .page{border:1px solid #e5dcc8;border-radius:18px;padding:24px 28px;background:#fffdf9;box-shadow:0 10px 30px rgba(15,23,42,0.06)} .header{border-bottom:1px solid #e8dcc8;padding-bottom:14px;margin-bottom:18px}.brand{font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#8b7a5d}.brand-mark{max-height:44px;width:auto}.title{font-size:24px;font-weight:700;margin:6px 0 6px;color:#111827}.meta{font-size:12px;color:#6b7280}.body{font-size:13px;line-height:1.7;color:#374151}.item{margin-bottom:10px;padding:10px 12px;border-left:3px solid #d9c09b;border-radius:0 8px 8px 0;background:#fcf7ee}.item .label{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#8b7a5d;margin-bottom:4px}.item .value{font-size:13px;color:#374151}</style></head><body><div class="page"><div class="header">${brandMarkup}<div class="title">${escapeHtml(input.title)}</div><div class="meta">Questionnaire</div></div><div class="body">${flattenResponse(input.responseData).map((line) => `<div class="item"><div class="label">Response</div><div class="value">${escapeHtml(line)}</div></div>`).join("")}</div></div></body></html>`;

  return renderHtmlToPdf(html);
}

async function getBrandingLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), "public", "branding", "ohmydesserts-logo-color.png");
    const file = await readFile(logoPath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function flattenResponse(value: Json, depth = 0): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenResponse(entry as Json, depth + 1));
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => {
    if (entry && typeof entry === "object") {
      return [`${indent(depth)}${toLabel(key)}:`, ...flattenResponse(entry as Json, depth + 1)];
    }

    if (entry === null || entry === "") return [];
    return [`${indent(depth)}${toLabel(key)}: ${String(entry)}`];
  });
}

function indent(depth: number) {
  return "  ".repeat(depth);
}

function toLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replaceAll("_", " ")
    .replace(/^./, (char) => char.toUpperCase());
}