export function resolveContractExportBody(input: {
  contractBody?: string | null;
  templateBody?: string | null;
}) {
  const snapshot = input.contractBody?.trim() ?? "";
  if (snapshot) return snapshot;

  return input.templateBody?.trim() ?? "";
}
