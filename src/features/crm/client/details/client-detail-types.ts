import type { Locale } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";
import type { ClientDetail } from "../types/client";

export type ClientDetailSectionProps = {
  client: ClientDetail;
  locale: Locale;
  refreshClient: () => Promise<void>;
  t: Translate;
};

export const formatClientDate = (value: string, locale: Locale) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
};
