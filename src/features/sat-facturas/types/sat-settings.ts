export type SatFiscalProfile = {
  constanciaFileUrl: string;
  id: string;
  isActive: boolean;
  label: string;
  legalName: string;
  opinionExpiresAt: string | null;
  opinionFileUrl: string;
  rfc: string;
  taxRegime: string;
};

export type SatBankAccount = {
  accountNumber: string;
  bankName: string;
  beneficiaryName: string;
  clabe: string;
  currency: string;
  fiscalProfileId: string | null;
  fiscalProfileLabel: string;
  id: string;
  isActive: boolean;
  nickname: string;
};

export type SatSettings = {
  bankAccounts: SatBankAccount[];
  fiscalProfiles: SatFiscalProfile[];
};

export type SatFiscalProfileFormValues = {
  constanciaFileUrl: string;
  isActive: boolean;
  label: string;
  legalName: string;
  opinionExpiresAt: string;
  opinionFileUrl: string;
  rfc: string;
  taxRegime: string;
};

export type SatBankAccountFormValues = {
  accountNumber: string;
  bankName: string;
  beneficiaryName: string;
  clabe: string;
  currency: string;
  fiscalProfileId: string;
  isActive: boolean;
  nickname: string;
};
