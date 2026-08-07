import {
  clientFormEn,
  clientFormEs,
} from "./client/form-dictionary";
import { clientListEn, clientListEs } from "./client/list-dictionary";
import { clientDetailEn, clientDetailEs } from "./client/detail-dictionary";

export const clientEn = {
  ...clientFormEn,
  ...clientDetailEn,
  ...clientListEn,
} as const;

export type ClientTranslationKey = keyof typeof clientEn;

export const clientEs = {
  ...clientFormEs,
  ...clientDetailEs,
  ...clientListEs,
} satisfies Record<ClientTranslationKey, string>;
