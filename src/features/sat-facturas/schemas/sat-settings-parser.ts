import type {
  SatBankAccountFormValues,
  SatFiscalProfileFormValues,
} from "../types/sat-settings";
import {
  initialBankAccountValues,
  initialFiscalProfileValues,
} from "./sat-settings-schema";

type InputRecord = Record<string, unknown>;

const record = (input: unknown): InputRecord =>
  input && typeof input === "object" ? (input as InputRecord) : {};

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");
const booleanValue = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

export function parseFiscalProfileValues(
  input: unknown,
): SatFiscalProfileFormValues {
  const source = record(input);

  return {
    constanciaFileUrl: stringValue(source.constanciaFileUrl),
    isActive: booleanValue(source.isActive, initialFiscalProfileValues.isActive),
    label: stringValue(source.label),
    legalName: stringValue(source.legalName),
    opinionExpiresAt: stringValue(source.opinionExpiresAt),
    opinionFileUrl: stringValue(source.opinionFileUrl),
    rfc: stringValue(source.rfc),
    taxRegime: stringValue(source.taxRegime) || initialFiscalProfileValues.taxRegime,
  };
}

export function parseBankAccountValues(input: unknown): SatBankAccountFormValues {
  const source = record(input);

  return {
    accountNumber: stringValue(source.accountNumber),
    bankName: stringValue(source.bankName),
    beneficiaryName: stringValue(source.beneficiaryName),
    clabe: stringValue(source.clabe),
    currency: stringValue(source.currency) || initialBankAccountValues.currency,
    fiscalProfileId: stringValue(source.fiscalProfileId),
    isActive: booleanValue(source.isActive, initialBankAccountValues.isActive),
    nickname: stringValue(source.nickname),
  };
}
