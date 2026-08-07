import type { TranslationKey } from "@/core/i18n";

import type { StaffPosition } from "../types/staff";

type StaffOption<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const eventStaffPositionOptions: StaffOption<StaffPosition>[] = [
  { value: "driver_a", translationKey: "crm.staff.position.driverA" },
  { value: "driver_b", translationKey: "crm.staff.position.driverB" },
  { value: "operator_1", translationKey: "crm.staff.position.operator1" },
  { value: "operator_2", translationKey: "crm.staff.position.operator2" },
  { value: "operator_3", translationKey: "crm.staff.position.operator3" },
  { value: "operator_4", translationKey: "crm.staff.position.operator4" },
  { value: "operator_5", translationKey: "crm.staff.position.operator5" },
  { value: "operator_6", translationKey: "crm.staff.position.operator6" },
  { value: "other", translationKey: "crm.staff.position.other" },
];

export const runSheetStaffPositions: StaffPosition[] = [
  "driver_a",
  "driver_b",
  "operator_1",
  "operator_2",
  "operator_3",
  "operator_4",
  "operator_5",
  "operator_6",
];

export const staffIdTypeOptions = [
  { value: "ine", translationKey: "crm.staff.idType.ine" },
  { value: "permanent_residence", translationKey: "crm.staff.idType.permanentResidence" },
  { value: "drivers_license", translationKey: "crm.staff.idType.driversLicense" },
  { value: "other", translationKey: "crm.staff.idType.other" },
] satisfies StaffOption<string>[];

export const staffBankOptions = [
  "BBVA",
  "Banorte",
  "Citibanamex",
  "Santander",
  "HSBC",
  "Scotiabank",
  "Inbursa",
  "Banco Azteca",
  "Nu",
  "Klar",
  "Mercado Pago",
  "Plata",
  "Stori",
  "Spin",
  "Other",
].map((value) => ({ label: value, value }));
