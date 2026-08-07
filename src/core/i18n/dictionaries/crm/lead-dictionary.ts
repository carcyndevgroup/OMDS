import {
  leadEn as leadFormEn,
  leadEs as leadFormEs,
} from "./lead/form-dictionary";
import { leadDetailEn, leadDetailEs } from "./lead/detail-dictionary";
import { leadListEn, leadListEs } from "./lead/list-dictionary";

export const leadEn = {
  ...leadFormEn,
  ...leadDetailEn,
  ...leadListEn,
} as const;

export type LeadTranslationKey = keyof typeof leadEn;

export const leadEs = {
  ...leadFormEs,
  ...leadDetailEs,
  ...leadListEs,
} satisfies Record<LeadTranslationKey, string>;
