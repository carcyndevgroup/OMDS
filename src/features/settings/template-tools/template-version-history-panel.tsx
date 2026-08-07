import type { TranslationKey } from "@/core/i18n";

type TemplateVersionItem = {
  createdAt: string;
  id: string;
  versionNumber: number;
};

type TemplateVersionDiffRow = {
  currentValue: string;
  label: string;
  versionValue: string;
};

type TemplateVersionHistoryPanelProps = {
  diffRows: TemplateVersionDiffRow[];
  hasError: boolean;
  isLoading: boolean;
  onRollback: (versionId: string) => void;
  onSelectVersion: (versionId: string) => void;
  rollbackError: string | null;
  rollbackSuccess: boolean;
  rollbackingVersionId: string | null;
  selectedVersionId: string | null;
  t: (key: TranslationKey) => string;
  versions: TemplateVersionItem[];
};

export function TemplateVersionHistoryPanel(props: TemplateVersionHistoryPanelProps) {
  const {
    diffRows,
    hasError,
    isLoading,
    onRollback,
    onSelectVersion,
    rollbackError,
    rollbackSuccess,
    rollbackingVersionId,
    selectedVersionId,
    t,
    versions,
  } = props;

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-bold text-cyan-200">{t("settings.templateHistory.title")}</h2>
      <p className="mt-1 text-xs text-zinc-500">{t("settings.templateHistory.subtitle")}</p>

      {isLoading ? <p className="mt-3 text-xs text-zinc-500">{t("settings.templateHistory.loading")}</p> : null}
      {hasError ? <p className="mt-3 text-xs text-rose-300">{t("settings.templateHistory.loadError")}</p> : null}

      {!isLoading && !hasError ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,240px)_1fr]">
          <div className="space-y-2">
            {versions.length === 0 ? <p className="text-xs text-zinc-500">{t("settings.templateHistory.empty")}</p> : null}
            {versions.map((version) => {
              const isSelected = version.id === selectedVersionId;
              const isRollbacking = rollbackingVersionId === version.id;

              return (
                <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2" key={version.id}>
                  <p className="text-xs font-semibold text-zinc-100">
                    {t("settings.templateHistory.field.version")} {version.versionNumber}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {t("settings.templateHistory.field.createdAt")}: {new Date(version.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      className={`rounded border px-2 py-1 text-[11px] font-semibold ${
                        isSelected
                          ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                          : "border-zinc-700 text-zinc-200 hover:border-zinc-500"
                      }`}
                      onClick={() => onSelectVersion(version.id)}
                      type="button"
                    >
                      {t("settings.templateHistory.action.compare")}
                    </button>
                    <button
                      className="rounded border border-amber-500/60 px-2 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/10"
                      disabled={isRollbacking}
                      onClick={() => onRollback(version.id)}
                      type="button"
                    >
                      {isRollbacking ? t("settings.templateHistory.status.rollbacking") : t("settings.templateHistory.action.rollback")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("settings.templateHistory.diffTitle")}</p>

            {selectedVersionId && diffRows.length ? (
              <div className="mt-2 space-y-2">
                {diffRows.map((row) => (
                  <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2" key={row.label}>
                    <p className="text-xs font-semibold text-zinc-200">{row.label}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">{t("settings.templateHistory.field.current")}</p>
                    <p className="text-xs text-zinc-100">{row.currentValue}</p>
                    <p className="mt-2 text-[11px] text-zinc-500">{t("settings.templateHistory.field.selectedVersion")}</p>
                    <p className="text-xs text-zinc-100">{row.versionValue}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">{t("settings.templateHistory.empty")}</p>
            )}

            {rollbackSuccess ? <p className="mt-3 text-xs font-semibold text-emerald-300">{t("settings.templateHistory.status.rollbackSuccess")}</p> : null}
            {rollbackError ? <p className="mt-3 text-xs font-semibold text-rose-300">{rollbackError}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
