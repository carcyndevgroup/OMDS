import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";

type VenueTabPlaceholderProps = {
  bodyKey: TranslationKey;
  t: Translate;
  titleKey: TranslationKey;
};

export function VenueTabPlaceholder({
  bodyKey,
  t,
  titleKey,
}: VenueTabPlaceholderProps) {
  return (
    <section className="rounded-md border border-dashed border-zinc-800 bg-zinc-900/60 p-8">
      <h2 className="text-2xl font-bold text-zinc-100">{t(titleKey)}</h2>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
        {t(bodyKey)}
      </p>
    </section>
  );
}
