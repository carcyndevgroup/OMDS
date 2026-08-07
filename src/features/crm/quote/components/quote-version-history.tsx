import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteVersionMeta, QuoteVersionStatus } from "../types/quote";

type QuoteVersionHistoryProps = {
  statusKeys: Record<QuoteVersionStatus, Parameters<Translate>[0]>;
  t: Translate;
  versions: QuoteVersionMeta[];
};

export function QuoteVersionHistory({
  statusKeys,
  t,
  versions,
}: QuoteVersionHistoryProps) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
      {versions.map((version) => (
        <span
          className="rounded bg-zinc-950 px-2.5 py-1 text-xs font-bold text-zinc-400"
          key={version.id}
        >
          {t("crm.quote.version")} {version.versionNumber}: {t(statusKeys[version.status])}
        </span>
      ))}
    </div>
  );
}
