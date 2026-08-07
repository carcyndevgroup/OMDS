type DocumentKind = "contract" | "invoice" | "questionnaire" | "quote";

const prefixes: Record<DocumentKind, string> = {
  contract: "CON",
  invoice: "INV",
  questionnaire: "QNR",
  quote: "QUO",
};

function stableFourDigits(id: string) {
  const compact = id.replace(/-/g, "").slice(0, 12);
  let value = 0;

  for (const char of compact) {
    const parsed = Number.parseInt(char, 16);
    if (!Number.isNaN(parsed)) value = (value * 16 + parsed) % 10000;
  }

  return value.toString().padStart(4, "0");
}

export function buildDocumentNumber(kind: DocumentKind, id: string) {
  return `${prefixes[kind]}${stableFourDigits(id)}`;
}

export function buildDocumentFilename(kind: DocumentKind, id: string, versionNumber?: number) {
  const number = buildDocumentNumber(kind, id);
  if (kind === "quote") {
    const versionSuffix = versionNumber && versionNumber > 0 ? `-v${versionNumber}` : "";
    return `OMDS-${number}${versionSuffix}.pdf`;
  }
  return `OMDS-${number}.pdf`;
}
