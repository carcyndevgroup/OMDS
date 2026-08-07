export type TemplateLocale = "en" | "es";

export type TemplateLocaleParityReport = {
  counterpartKey: string | null;
  currentLocale: TemplateLocale | null;
  missingInCounterpart: string[];
  missingInCurrent: string[];
  status: "mismatch" | "ok" | "unpaired";
};

type ScopedTemplateTokens = {
  scopeKey: string;
  templateKey: string;
  tokens: string[];
};

const localeSuffixPattern = /^(.*?)(?:[._:-](en|es))$/i;

export function parseTemplateLocaleKey(templateKey: string) {
  const value = templateKey.trim();
  const match = value.match(localeSuffixPattern);
  if (!match) return { baseKey: value.toLowerCase(), locale: null as TemplateLocale | null };

  const locale = match[2]?.toLowerCase();
  return {
    baseKey: match[1].trim().toLowerCase(),
    locale: locale === "en" || locale === "es" ? (locale as TemplateLocale) : null,
  };
}

export function buildTemplateLocaleParityReport(
  currentTemplate: ScopedTemplateTokens,
  allTemplates: ScopedTemplateTokens[],
): TemplateLocaleParityReport {
  const parsedCurrent = parseTemplateLocaleKey(currentTemplate.templateKey);
  if (!parsedCurrent.locale) {
    return {
      counterpartKey: null,
      currentLocale: null,
      missingInCounterpart: [],
      missingInCurrent: [],
      status: "unpaired",
    };
  }

  const counterpartLocale: TemplateLocale = parsedCurrent.locale === "en" ? "es" : "en";
  const counterpart = findCounterpart(currentTemplate, allTemplates, parsedCurrent.baseKey, counterpartLocale);
  if (!counterpart) {
    return {
      counterpartKey: null,
      currentLocale: parsedCurrent.locale,
      missingInCounterpart: [],
      missingInCurrent: [],
      status: "unpaired",
    };
  }

  const missingInCounterpart = difference(currentTemplate.tokens, counterpart.tokens);
  const missingInCurrent = difference(counterpart.tokens, currentTemplate.tokens);
  return {
    counterpartKey: counterpart.templateKey,
    currentLocale: parsedCurrent.locale,
    missingInCounterpart,
    missingInCurrent,
    status: missingInCounterpart.length === 0 && missingInCurrent.length === 0 ? "ok" : "mismatch",
  };
}

function findCounterpart(
  currentTemplate: ScopedTemplateTokens,
  allTemplates: ScopedTemplateTokens[],
  baseKey: string,
  locale: TemplateLocale,
) {
  const scoped = allTemplates.find((template) => {
    const parsed = parseTemplateLocaleKey(template.templateKey);
    return (
      parsed.baseKey === baseKey
      && parsed.locale === locale
      && template.scopeKey === currentTemplate.scopeKey
    );
  });

  if (scoped) return scoped;

  return allTemplates.find((template) => {
    const parsed = parseTemplateLocaleKey(template.templateKey);
    return parsed.baseKey === baseKey && parsed.locale === locale;
  }) ?? null;
}

function difference(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return Array.from(new Set(left.filter((token) => !rightSet.has(token)))).sort((a, b) => a.localeCompare(b));
}
