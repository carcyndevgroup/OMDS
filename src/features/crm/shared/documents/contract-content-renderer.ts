type ContractContentBlock =
  | { kind: "heading1"; text: string }
  | { kind: "heading2"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[]; ordered: boolean };

function stripTags(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n?/g, "\n")
    .trim();
}

export function parseContractContentBlocks(html: string): ContractContentBlock[] {
  const normalized = html.trim();
  if (!normalized) return [];

  const blocks: ContractContentBlock[] = [];
  const blockPattern = /<(h1|h2|p|div|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const listItemPattern = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  const blockMatches = Array.from(normalized.matchAll(blockPattern));

  if (blockMatches.length) {
    for (const match of blockMatches) {
      const tagName = (match[1] ?? "").toLowerCase();
      const innerHtml = match[2] ?? "";

      if (tagName === "h1") {
        const text = stripTags(innerHtml);
        if (text) blocks.push({ kind: "heading1", text });
        continue;
      }

      if (tagName === "h2") {
        const text = stripTags(innerHtml);
        if (text) blocks.push({ kind: "heading2", text });
        continue;
      }

      if (tagName === "p" || tagName === "div") {
        const text = stripTags(innerHtml);
        if (text) blocks.push({ kind: "paragraph", text });
        continue;
      }

      const items = Array.from(innerHtml.matchAll(listItemPattern), (itemMatch) => {
        const capture = itemMatch[1];
        return stripTags(typeof capture === "string" ? capture : "");
      }).filter(Boolean);
      if (items.length) {
        blocks.push({ kind: "list", items, ordered: tagName === "ol" });
      }
    }

    return blocks;
  }

  const plainText = stripTags(normalized);
  return plainText ? [{ kind: "paragraph", text: plainText }] : [];
}

function applySharedClassesToTag(html: string, tagName: string, baseClasses: string[]) {
  const tagPattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");

  return html.replace(tagPattern, (_match, attributes = "") => {
    const classMatch = attributes.match(/\bclass\s*=\s*(["'])(.*?)\1/i);
    const existingClasses = classMatch?.[2]?.trim() ?? "";
    const mergedClasses = Array.from(new Set([...baseClasses, ...(existingClasses ? existingClasses.split(/\s+/) : [])])).filter(Boolean);
    const combinedClasses = mergedClasses.join(" ");
    const normalizedAttributes = attributes.trim();

    if (!combinedClasses) {
      return `<${tagName}${normalizedAttributes ? ` ${normalizedAttributes}` : ""}>`;
    }

    const nextAttributes = classMatch
      ? normalizedAttributes.replace(/\bclass\s*=\s*(["']).*?\1/i, `class="${combinedClasses}"`)
      : normalizedAttributes
        ? `${normalizedAttributes} class="${combinedClasses}"`
        : `class="${combinedClasses}"`;

    return `<${tagName}${nextAttributes ? ` ${nextAttributes}` : ""}>`;
  });
}

function applyTokenOverrides(value: string, tokenOverrides?: Record<string, string>) {
  if (!tokenOverrides) return value;

  return value.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (match, tokenKey: string) => {
    const normalized = tokenKey.trim();
    return tokenOverrides[normalized] ?? match;
  });
}

export function renderContractPreviewHtml(html: string, tokenOverrides?: Record<string, string>) {
  const normalized = html.trim();
  if (!normalized) return "";

  let rendered = applyTokenOverrides(normalized, tokenOverrides);
  rendered = applySharedClassesToTag(rendered, "p", ["m-0", "leading-7", "text-[15px]", "text-slate-700"]);
  rendered = applySharedClassesToTag(rendered, "h1", ["text-[20px]", "font-semibold", "tracking-[0.08em]", "uppercase", "text-slate-900", "mb-4", "mt-8"]);
  rendered = applySharedClassesToTag(rendered, "h2", ["text-[15px]", "font-semibold", "tracking-[0.14em]", "uppercase", "text-slate-800", "mb-3", "mt-6"]);
  rendered = applySharedClassesToTag(rendered, "ul", ["my-4", "space-y-2", "pl-5", "text-slate-700"]);
  rendered = applySharedClassesToTag(rendered, "ol", ["my-4", "space-y-2", "pl-5", "text-slate-700"]);
  rendered = applySharedClassesToTag(rendered, "li", ["leading-7"]);

  const coverMarkup = `<section class="mb-8 overflow-hidden rounded-[24px] border border-[#e4ddd6] bg-[linear-gradient(135deg,#fffdf8_0%,#f7eedf_100%)] p-8 text-center shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]">
    <div class="mx-auto flex max-w-[460px] flex-col items-center gap-3">
      <div class="flex items-center justify-center rounded-full border border-[#e4ddd6] bg-white/80 p-3 shadow-sm">
        <img src="/branding/ohmydesserts-logo-color.png" alt="OMDS logo" class="h-20 w-20 object-contain" />
      </div>
      <div class="inline-flex items-center gap-2 rounded-full border border-[#e4ddd6] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
        <span class="h-2 w-2 rounded-full bg-[#c89d5c]"></span>
        {{company.legalName}}
      </div>
      <h1 class="text-[24px] font-extrabold uppercase tracking-[0.12em] text-slate-900">Catering Services Contract</h1>
      <p class="text-[15px] leading-7 text-slate-700">A formal agreement between the client and {{company.dbaName}} for the catered event services described below.</p>
      <div class="mt-3 grid w-full gap-2 rounded-[18px] border border-[#ece3d2] bg-[#fcf7eb] p-4 text-left text-sm text-slate-600">
        <div class="flex items-center justify-between gap-3"><span class="font-semibold uppercase tracking-[0.2em] text-slate-500">Client</span><span>{{client.legalfullname}}</span></div>
        <div class="flex items-center justify-between gap-3"><span class="font-semibold uppercase tracking-[0.2em] text-slate-500">Event date</span><span>{{event.datefull}}</span></div>
        <div class="flex items-center justify-between gap-3"><span class="font-semibold uppercase tracking-[0.2em] text-slate-500">Terms</span><span>Confirmed by signature</span></div>
      </div>
    </div>
  </section>`;

  const signatureMarkup = `<section class="mt-8 rounded-[20px] border border-[#e4ddd6] bg-white/80 p-6 shadow-[0_12px_35px_-25px_rgba(15,23,42,0.3)]">
    <h2 class="text-[15px] font-semibold uppercase tracking-[0.14em] text-slate-800">Authorized Signatures</h2>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div class="rounded-[16px] border border-[#e4ddd6] bg-[#fcf9f2] p-4">
        <div class="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Client</div>
        <div class="mt-3 h-12 border-b border-[#d3c7b3]"></div>
        <div class="mt-3 text-[15px] text-slate-700">{{client.legalfullname}}</div>
      </div>
      <div class="rounded-[16px] border border-[#e4ddd6] bg-[#fcf9f2] p-4">
        <div class="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">OMDS</div>
        <div class="mt-3 h-12 border-b border-[#d3c7b3]"></div>
        <div class="mt-3 text-[15px] text-slate-700">{{company.legalName}}</div>
      </div>
    </div>
  </section>`;

  const hasCover = rendered.includes("<h1") && !rendered.includes("contract-cover");
  const content = hasCover ? `${applyTokenOverrides(coverMarkup, tokenOverrides)}${rendered}${applyTokenOverrides(signatureMarkup, tokenOverrides)}` : rendered;

  return `<div class="rounded-[32px] border border-[#d8c8a0] bg-[linear-gradient(180deg,#fefcf9_0%,#f7eee0_100%)] p-6 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.35)] text-slate-800 font-serif">${content}</div>`;
}

export function renderContractPdfText(html: string) {
  const normalized = html.trim();
  if (!normalized) return "";

  const bodyText = normalized
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<h1\b[^>]*>/gi, "\n\n## ")
    .replace(/<h2\b[^>]*>/gi, "\n\n### ")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-2]>/gi, "\n\n")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<strong>/gi, "")
    .replace(/<\/strong>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return bodyText.trim();
}
