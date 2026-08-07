import { appEn, appEs } from "./dictionaries/app-dictionary";
import { authEn, authEs } from "./dictionaries/auth-dictionary";
import { crmEn, crmEs } from "./dictionaries/crm-dictionary";
import { payrollEn, payrollEs } from "./dictionaries/payroll-dictionary";
import { satFacturaEn, satFacturaEs } from "./dictionaries/sat-factura-dictionary";
import {
  satFacturaWorkflowEn,
  satFacturaWorkflowEs,
} from "./dictionaries/sat-factura-workflow-dictionary";
import { satPaymentEn, satPaymentEs } from "./dictionaries/sat-payment-dictionary";
import { satSettingsEn, satSettingsEs } from "./dictionaries/sat-settings-dictionary";
import { settingsEn, settingsEs } from "./dictionaries/settings-dictionary";
import { settingsPayrollTaskEn, settingsPayrollTaskEs } from "./dictionaries/settings-payroll-task-dictionary";
import type { Locale } from "./i18n-context";

const en = {
  ...appEn,
  ...authEn,
  ...crmEn,
  ...payrollEn,
  ...satFacturaEn,
  ...satFacturaWorkflowEn,
  ...satPaymentEn,
  ...satSettingsEn,
  ...settingsEn,
  ...settingsPayrollTaskEn,
} as const;

const es = {
  ...appEs,
  ...authEs,
  ...crmEs,
  ...payrollEs,
  ...satFacturaEs,
  ...satFacturaWorkflowEs,
  ...satPaymentEs,
  ...satSettingsEs,
  ...settingsEs,
  ...settingsPayrollTaskEs,
} satisfies Record<TranslationKey, string>;

export type TranslationKey = keyof typeof en;

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  es,
};
