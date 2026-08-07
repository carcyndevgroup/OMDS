import type { Locale } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";
import type { EventDetail } from "../types/event";

export type EventDetailSectionProps = {
  event: EventDetail;
  locale: Locale;
  t: Translate;
};

export const formatEventDate = (value: string, locale: Locale) => {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
};
