const TEMPLATE_TOKEN_PATTERN = /{{\s*([a-zA-Z0-9_.]+)\s*}}/g;

import { applyConditionalBlocks } from "./template-condition-library";

type TemplateTokenDefinition = {
  sampleValue: string;
  token: string;
};

type TemplateTokenGroupDefinition = {
  id: string;
  labelKey:
    | "settings.templateTokens.group.client"
    | "settings.templateTokens.group.event"
    | "settings.templateTokens.group.venue"
    | "settings.templateTokens.group.financial"
    | "settings.templateTokens.group.lineItems"
    | "settings.templateTokens.group.schedule"
    | "settings.templateTokens.group.signature"
    | "settings.templateTokens.group.company";
  tokens: readonly TemplateTokenDefinition[];
};

export const templateTokenGroups: readonly TemplateTokenGroupDefinition[] = [
  {
    id: "client",
    labelKey: "settings.templateTokens.group.client",
    tokens: [
      { sampleValue: "Jane Doe", token: "client.fullName" },
      { sampleValue: "jane@example.com", token: "client.email" },
      { sampleValue: "+52 55 0100 0000", token: "client.phone" },
      { sampleValue: "WhatsApp", token: "client.preferredCommunication" },
    ],
  },
  {
    id: "event",
    labelKey: "settings.templateTokens.group.event",
    tokens: [
      { sampleValue: "Jane & Alex Wedding", token: "event.name" },
      { sampleValue: "Wedding", token: "event.type" },
      { sampleValue: "Direct", token: "event.bookingType" },
      { sampleValue: "2026-12-10", token: "event.date" },
      { sampleValue: "120", token: "event.guestCount" },
    ],
  },
  {
    id: "venue",
    labelKey: "settings.templateTokens.group.venue",
    tokens: [
      { sampleValue: "Hacienda Aurora", token: "venue.name" },
      { sampleValue: "Carretera 123, Monterrey", token: "venue.address" },
      { sampleValue: "Mariana Vega", token: "venue.contactName" },
      { sampleValue: "+52 55 0200 0000", token: "venue.contactPhone" },
    ],
  },
  {
    id: "financial",
    labelKey: "settings.templateTokens.group.financial",
    tokens: [
      { sampleValue: "$48,000 MXN", token: "quote.total" },
      { sampleValue: "$12,000 MXN", token: "quote.retainer" },
      { sampleValue: "$36,000 MXN", token: "quote.balance" },
      { sampleValue: "2026-11-25", token: "invoice.dueDate" },
      // --- financials.* tokens: registered but not yet wired to live contract data ---
      // Source candidates once wired:
      //   financials.subtotal     → sum of accepted quote version line items (before tax)
      //   financials.tax          → 16% IVA on subtotal
      //   financials.total        → subtotal + tax (overlaps quote.total)
      //   financials.retainer_mxn → retainer invoice total_mxn
      //   financials.retainer_usd → USD conversion — no USD field in system yet; needs investigation
      //   financials.balance_mxn  → balance invoice total_mxn
      //   financials.balance_usd  → USD conversion — no USD field in system yet; needs investigation
      //   financials.balance_due_date → balance invoice due_at (overlaps invoice.dueDate)
      { sampleValue: "$41,379.31 MXN", token: "financials.subtotal" },
      { sampleValue: "$6,620.69 MXN", token: "financials.tax" },
      { sampleValue: "$48,000.00 MXN", token: "financials.total" },
      { sampleValue: "$16,800.00 MXN", token: "financials.retainer_mxn" },
      { sampleValue: "$840.00 USD", token: "financials.retainer_usd" },
      { sampleValue: "40", token: "financials.retainer_percent" },
      { sampleValue: "$31,200.00 MXN", token: "financials.balance_mxn" },
      { sampleValue: "$1,560.00 USD", token: "financials.balance_usd" },
      { sampleValue: "60", token: "financials.final_payment_percent" },
      { sampleValue: "2026-11-25", token: "financials.balance_due_date" },
    ],
  },
  {
    // item.* tokens: registered but not yet wired to live contract data
    // Source candidates once wired:
    //   item.name_N  → accepted quote version items[N-1] name/title field
    //   item.desc_N  → accepted quote version items[N-1] description
    //   item.qty_N   → accepted quote version items[N-1] quantity
    //   item.unit_N  → accepted quote version items[N-1] unit_price_mxn
    //   item.total_N → accepted quote version items[N-1] line_total_mxn (qty × unit)
    // Only items 1–2 are currently in the default template; more can be added following the same pattern.
    id: "lineItems",
    labelKey: "settings.templateTokens.group.lineItems",
    tokens: [
      { sampleValue: "Dessert Buffet", token: "item.name_1" },
      { sampleValue: "120-guest premium dessert station", token: "item.desc_1" },
      { sampleValue: "120", token: "item.qty_1" },
      { sampleValue: "$180.00", token: "item.unit_1" },
      { sampleValue: "$21,600.00", token: "item.total_1" },
      { sampleValue: "Candy Cart", token: "item.name_2" },
      { sampleValue: "Classic candy cart setup and service", token: "item.desc_2" },
      { sampleValue: "1", token: "item.qty_2" },
      { sampleValue: "$8,000.00", token: "item.unit_2" },
      { sampleValue: "$8,000.00", token: "item.total_2" },
    ],
  },
  {
    id: "schedule",
    labelKey: "settings.templateTokens.group.schedule",
    tokens: [
      { sampleValue: "18:00", token: "event.serviceStartTime" },
      { sampleValue: "23:00", token: "event.serviceEndTime" },
      { sampleValue: "Main Garden", token: "event.serviceLocation" },
      { sampleValue: "OMDS Team", token: "sender.name" },
    ],
  },
  {
    id: "company",
    labelKey: "settings.templateTokens.group.company",
    tokens: [
      { sampleValue: "Oh My Desserts & Snacks MX", token: "company.legalName" },
      { sampleValue: "OMDS Catering", token: "company.dbaName" },
      { sampleValue: "Jardines Del Sur II, Cancún, Q.R., 77535", token: "company.address" },
      { sampleValue: "+52 998 123 4567", token: "company.phone" },
      { sampleValue: "hello@omds.com", token: "company.email" },
      { sampleValue: "https://omds.com", token: "company.website" },
    ],
  },
  {
    id: "signature",
    labelKey: "settings.templateTokens.group.signature",
    tokens: [
      { sampleValue: "Tuesday, March 2, 2027", token: "event.datefull" },
      { sampleValue: "Jane A. Doe", token: "client.legalfullname" },
      { sampleValue: "123 Main St, Cancún, Q.R., 77535", token: "client.addressfull" },
      { sampleValue: "Jane A. Doe", token: "client.digitalsignature" },
      { sampleValue: "Tuesday, March 2, 2027", token: "date.signed" },
      { sampleValue: "Carcyndev Example", token: "omds.legalfullname" },
      { sampleValue: "Authorized Signing Authority", token: "omds.title" },
      { sampleValue: "Carcyndev Example", token: "omds.digitalsignature" },
    ],
  },
] as const;

const tokenValueMap = templateTokenGroups.reduce<Record<string, string>>((accumulator, group) => {
  for (const token of group.tokens) accumulator[token.token] = token.sampleValue;
  return accumulator;
}, {});

export function extractTemplateTokenKeys(value: string) {
  if (!value) return [];

  const keys = new Set<string>();
  let current = TEMPLATE_TOKEN_PATTERN.exec(value);

  while (current) {
    const tokenKey = current[1]?.trim();
    if (tokenKey) keys.add(tokenKey);
    current = TEMPLATE_TOKEN_PATTERN.exec(value);
  }

  TEMPLATE_TOKEN_PATTERN.lastIndex = 0;
  return Array.from(keys);
}

export function findUnknownTemplateTokens(values: readonly string[]) {
  const unknown = new Set<string>();

  for (const value of values) {
    for (const tokenKey of extractTemplateTokenKeys(value)) {
      if (!tokenValueMap[tokenKey]) unknown.add(tokenKey);
    }
  }

  return Array.from(unknown).sort((left, right) => left.localeCompare(right));
}

export function renderTemplatePreview(
  value: string,
  context?: { bookingType?: string; documentKind?: string; eventType?: string },
  overrideTokens?: Record<string, string>,
) {
  if (!value) return "";

  const conditionRendered = context ? applyConditionalBlocks(value, context) : value;

  return conditionRendered.replace(TEMPLATE_TOKEN_PATTERN, (match, tokenKey: string) => {
    const normalized = tokenKey.trim();
    return overrideTokens?.[normalized] ?? tokenValueMap[normalized] ?? match;
  });
}

export function insertTemplateToken(value: string, tokenKey: string) {
  const token = `{{${tokenKey}}}`;
  const trimmed = value.trim();

  if (!trimmed) return token;
  if (value.includes(token)) return value;

  const separator = value.endsWith("\n") ? "" : "\n";
  return `${value}${separator}${token}`;
}
