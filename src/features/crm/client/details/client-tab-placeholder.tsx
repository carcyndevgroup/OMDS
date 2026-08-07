import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";
import { ClientDetailSection } from "./client-detail-section";

type ClientTabPlaceholderProps = {
  bodyKey: TranslationKey;
  t: Translate;
  titleKey: TranslationKey;
};

export function ClientTabPlaceholder({
  bodyKey,
  t,
  titleKey,
}: ClientTabPlaceholderProps) {
  return (
    <ClientDetailSection title={t(titleKey)}>
      <p className="text-sm leading-6 text-zinc-500">{t(bodyKey)}</p>
    </ClientDetailSection>
  );
}
