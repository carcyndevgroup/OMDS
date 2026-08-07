export interface ContractPdfShellInput {
  bodyHtml: string;
  clientAddress?: string;
  clientName?: string;
  contractId?: string;
  documentTitle?: string;
  eventDateLabel?: string;
  logoSrc?: string | null;
  omdsAddress?: string;
  omdsDbaName?: string;
  omdsName?: string;
  signature?: {
    clientSignedName?: string;
    clientSignedAt?: string;
    omdsSignedName?: string;
    omdsSignedTitle?: string;
  };
  auditTrail?: Array<{ at: string; event: string; source?: string }>;
  signingMetadata?: {
    authenticationMethod?: string;
    documentHash?: string;
    ipAddress?: string | null;
    signedAt?: string;
    userAgent?: string | null;
  };
  venueName?: string;
}

function esc(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function normalizeContractBodyHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<\/?(p|h[1-4]|ul|ol|li|div|strong|em|u|br|table|thead|tbody|tr|th|td)\b/i.test(trimmed)) return trimmed;
  const lines = trimmed.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  const flush = () => { const p = paragraphLines.join(" ").trim(); if (p) blocks.push(`<p>${esc(p)}</p>`); paragraphLines = []; };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flush(); continue; }
    if (/^#{2}\s+/.test(line)) { flush(); blocks.push(`<h2>${esc(line.replace(/^#{2}\s+/, ""))}</h2>`); continue; }
    if (/^#{3}\s+/.test(line)) { flush(); blocks.push(`<h3>${esc(line.replace(/^#{3}\s+/, ""))}</h3>`); continue; }
    paragraphLines.push(line);
  }
  flush();
  return blocks.join("");
}

function splitBodyAtTerms(bodyHtml: string): { financialsHtml: string; termsHtml: string | null } {
  // Find the Terms & Conditions heading (may use &amp; or & and various capitalizations)
  const termsPattern = /<h2[^>]*>\s*TERMS\s*(?:&amp;|&)\s*CONDITIONS\s*<\/h2>/i;
  const match = termsPattern.exec(bodyHtml);
  if (!match || match.index === undefined) {
    return { financialsHtml: bodyHtml, termsHtml: null };
  }
  return {
    financialsHtml: bodyHtml.slice(0, match.index).trim(),
    termsHtml: bodyHtml.slice(match.index).trim(),
  };
}

function splitTermsByClauses(termsHtml: string): [string, string, string] {
  const cleanTerms = termsHtml.replace(/<h2[^>]*>[^<]*TERMS[^<]*<\/h2>/i, "").trim();

  const clause6 = /<h3[^>]*>\s*6\./i;
  const clause11 = /<h3[^>]*>\s*11\./i;

  const sixth = clause6.exec(cleanTerms);
  if (!sixth || sixth.index === undefined) {
    return [cleanTerms, "", ""];
  }

  const eleventh = clause11.exec(cleanTerms);
  if (!eleventh || eleventh.index === undefined) {
    return [cleanTerms.slice(0, sixth.index).trim(), cleanTerms.slice(sixth.index).trim(), ""];
  }

  return [
    cleanTerms.slice(0, sixth.index).trim(),
    cleanTerms.slice(sixth.index, eleventh.index).trim(),
    cleanTerms.slice(eleventh.index).trim(),
  ];
}


export function buildContractPdfHtml(input: ContractPdfShellInput): string {
  const {
    bodyHtml, clientName = "Client", clientAddress = "To be confirmed",
    contractId = "\u2014", documentTitle = "Catering Services Contract",
    eventDateLabel = "\u2014", logoSrc, omdsAddress = "Jardines Del Sur II, Canc\u00fan, Q.R., 77535",
    omdsDbaName = "Oh My Desserts & Snacks MX", omdsName = "Oh My Desserts & Snacks MX",
    signature, venueName = "\u2014", auditTrail = [], signingMetadata,
  } = input;
  const safeLogoSrc = logoSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root{--ink:#28231f;--muted:#6c625b;--rule:#e4ddd6;--accent:#b9875b;--paper:#fffdf8}
  *{box-sizing:border-box}html,body{margin:0;padding:0}
  body{font-family:Georgia,"Times New Roman",serif;color:var(--ink);line-height:1.50;font-size:11.5pt;background:var(--paper)}
  .page{padding:.10in .10in}
  .cover{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:.8in;min-height:9.4in}
  .cover .logo{width:120px;height:120px;margin-bottom:15px}
  .cover h1{font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0 0 20px}
  .cover .meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%;max-width:100%;margin:0 auto 20px}
  .cover .meta .item{border:1px solid var(--rule);border-radius:10px;padding:10px 12px;background:#fcf7eb}
  .cover .meta .label{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
  .cover .meta .value{font-size:12px;font-weight:600}
  .cover .section-title{font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin:20px 0 12px}
  .cover .intro,.cover .party,.cover .closing,.cover .body-text{margin:0 auto 10px;max-width:100%;font-size:11px}
  .cover .and{margin:12px 0 8px;font-size:13px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.1em}
  .clauses{page-break-before:always}
  .clauses.terms{page-break-before:always}
  .doc-header{display:flex;align-items:center;gap:10px;border-bottom:2px solid var(--accent);padding-bottom:12px;margin-bottom:16px}
  .doc-header img{width:30px;height:30px}
  .doc-header .t1{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  .doc-header .t2{font-size:9px;color:var(--muted);margin-top:2px}
  .clauses h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid var(--rule);padding-bottom:4px;margin:18px 0 8px}
  .clauses h3{font-size:11px;font-weight:700;margin:14px 0 6px}
  .clauses p,.clauses li{margin:0 0 6px;font-size:10pt}
  .clauses ol,.clauses ul{margin:0 0 8px;padding-left:20px}
  .clauses table{width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:9pt}
  .clauses table{table-layout:fixed}
  .clauses th{background:#f7eedf;text-transform:uppercase;letter-spacing:.1em;font-size:9px;color:var(--muted);padding:8px 10px;text-align:left}
  .clauses td{padding:8px 10px;border-bottom:1px solid var(--rule);vertical-align:top}
  .clauses em{color:var(--muted);font-style:italic}
  .sig-page{page-break-before:always}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
  .sig-box{border:1px solid var(--rule);border-radius:12px;padding:14px;background:#fcf7eb}
  .sig-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
  .sig-line{border-bottom:1px solid #c9beb2;height:38px;margin:14px 0 10px}
  .sig-name{font-size:12px;font-weight:600}
  .sig-muted{font-size:11px;color:var(--muted);margin-top:8px}
  .acceptance{margin-top:20px;padding:12px 14px;border:1px solid var(--rule);background:#fff;border-radius:8px;font-size:10px;line-height:1.45}
  .audit{margin-top:18px;border-top:1px solid var(--rule);padding-top:12px}.audit-title{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}.audit-row{font-size:9px;color:var(--muted);margin:3px 0}
  .verification{margin-top:14px;padding-top:10px;border-top:1px solid var(--rule);font-size:9px;color:var(--muted);line-height:1.45}.verification strong{color:var(--ink)}
  @page{size:letter;margin:.30in}
</style>
</head>
<body>
  <div class="page cover">
    <img class="logo" src="${safeLogoSrc}" alt="Oh My Desserts &amp; Snacks logo">
    <h1>${esc(documentTitle)}</h1>
    <div class="meta">
      <div class="item"><div class="label">Contract ID</div><div class="value">${esc(contractId)}</div></div>
      <div class="item"><div class="label">Event Date</div><div class="value">${esc(eventDateLabel)}</div></div>
      <div class="item"><div class="label">Venue</div><div class="value">${esc(venueName)}</div></div>
    </div>
    <div class="section-title">PREAMBLE</div>
    <p class="intro">This Catering Services Contract (the &ldquo;Contract&rdquo;) is entered into by and between:</p>
    <p class="party"><strong>${esc(clientName)}</strong><br>${esc(clientAddress)}<br><em>(hereinafter, the &ldquo;Client&rdquo;),</em></p>
    <div class="and">And</div>
    <p class="party"><strong>${esc(omdsName)}</strong><br>${esc(omdsAddress)}<br><em>(hereinafter, &ldquo;OMDS&rdquo;).</em></p>
    <p class="closing">(Hereinafter collectively referred to as the &ldquo;Parties&rdquo;).</p>
    <p class="body-text">This document establishes the definitive commercial and legal terms under which OMDS will provide its live catering services. Specific financial details and the corresponding payment schedule are detailed on Page 2 of this instrument.</p>
  </div>
  ${(() => {
    const { financialsHtml, termsHtml } = splitBodyAtTerms(bodyHtml);
    const mkHdr = (s: string) =>
      `<div class="doc-header"><img src="${safeLogoSrc}" alt="OMDS"><div><div class="t1">${esc(omdsDbaName)} &bull; ${s}</div><div class="t2">${esc(clientName)} &bull; ${esc(eventDateLabel)} &bull; ${esc(contractId)}</div></div></div>`;
    const fin = `<div class="page clauses">${mkHdr("FINANCIALS &amp; DYNAMIC PAYMENT SCHEDULE")}${financialsHtml}</div>`;
    if (!termsHtml) return fin;

    const [termsPageOne, termsPageTwo, termsPageThree] = splitTermsByClauses(termsHtml);
    const t1 = `<div class="page clauses terms">${mkHdr("TERMS &amp; CONDITIONS")}<h2>TERMS &amp; CONDITIONS</h2>${termsPageOne}</div>`;
    const t2 = termsPageTwo ? `<div class="page clauses terms">${mkHdr("TERMS &amp; CONDITIONS")}${termsPageTwo}</div>` : "";
    const t3 = termsPageThree ? `<div class="page clauses terms">${mkHdr("TERMS &amp; CONDITIONS")}${termsPageThree}</div>` : "";

    return fin + t1 + t2 + t3;
  })()}
  <div class="page sig-page">
    <div class="doc-header">
      <img src="${safeLogoSrc}" alt="OMDS">
      <div><div class="t1">Authorized Signatures</div><div class="t2">${esc(clientName)}${eventDateLabel !== "\u2014" ? ` \u2022 ${esc(eventDateLabel)}` : ""}</div></div>
    </div>
    <p style="font-size:13px;margin:0 0 14px">The parties acknowledge and approve the terms above by signing below.</p>
    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-label">Client</div>
        <div class="sig-line"></div>
        <div class="sig-name">${esc(signature?.clientSignedName || clientName)}</div>
        <div class="sig-muted">${signature?.clientSignedAt ? `Signed electronically on ${esc(signature.clientSignedAt)}` : "Awaiting signature"}</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">OMDS</div>
        <div class="sig-line"></div>
        <div class="sig-name">${signature?.omdsSignedName ? esc(signature.omdsSignedName) : ""}</div>
        <div class="sig-muted">Authorized by ${esc(omdsDbaName)}</div>
      </div>
    </div>
    <div class="acceptance">[${signature?.clientSignedAt ? "x" : " "}] By checking this box, I acknowledge that I am signing this agreement electronically and that my electronic signature is the legally binding equivalent of my handwritten signature.</div>
    <div class="audit"><div class="audit-title">Full Audit Trail</div>${auditTrail.length ? auditTrail.map((entry) => `<div class="audit-row">${esc(new Date(entry.at).toISOString())} &bull; ${esc(entry.event)}${entry.source ? ` &bull; ${esc(entry.source)}` : ""}</div>`).join("") : "<div class=\"audit-row\">No recorded events.</div>"}</div>
    ${signingMetadata ? `<div class="verification"><div><strong>Document hash (SHA-256):</strong> ${esc(signingMetadata.documentHash || "Not recorded")}</div><div><strong>Authentication:</strong> ${esc(signingMetadata.authenticationMethod || "Not recorded")}</div>${signingMetadata.signedAt ? `<div><strong>Signed at (UTC):</strong> ${esc(new Date(signingMetadata.signedAt).toISOString())}</div>` : ""}${signingMetadata.ipAddress ? `<div><strong>Signing IP:</strong> ${esc(signingMetadata.ipAddress)}</div>` : ""}${signingMetadata.userAgent ? `<div><strong>User agent:</strong> ${esc(signingMetadata.userAgent)}</div>` : ""}</div>` : ""}
  </div>
</body>
</html>`;
}
