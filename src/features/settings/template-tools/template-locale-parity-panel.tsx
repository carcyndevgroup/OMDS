import type { TranslationKey } from "@/core/i18n";

import type { TemplateLocaleParityReport } from "./template-locale-parity";

type TemplateLocaleParityPanelProps = {
  report: TemplateLocaleParityReport;
  t: (key: TranslationKey) => string;
};

export function TemplateLocaleParityPanel(props: TemplateLocaleParityPanelProps) {
  const { report, t } = props;

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-bold text-cyan-200">{t("settings.templateParity.title")}</h2>
      <p className="mt-1 text-xs text-zinc-500">{t("settings.templateParity.subtitle")}</p>

      <div className="mt-3 rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("settings.templateParity.field.currentLocale")}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">
          {report.currentLocale === "en" ? t("settings.templateParity.locale.en") : report.currentLocale === "es" ? t("settings.templateParity.locale.es") : t("settings.templateParity.status.unpaired")}
        </p>
      </div>

      <div className="mt-3 rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("settings.templateParity.field.counterpart")}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">{report.counterpartKey ?? "-"}</p>
      </div>

      {report.status === "ok" ? (
        <p className="mt-3 text-xs font-semibold text-emerald-300">{t("settings.templateParity.status.ok")}</p>
      ) : null}

      {report.status === "unpaired" ? (
        <p className="mt-3 text-xs font-semibold text-amber-300">{t("settings.templateParity.status.unpaired")}</p>
      ) : null}

      {report.status === "mismatch" ? (
        <div className="mt-3 space-y-2 rounded border border-amber-400/40 bg-amber-500/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-200">{t("settings.templateParity.status.mismatch")}</p>

          {report.missingInCounterpart.length ? (
            <div>
              <p className="text-xs font-semibold text-amber-100">{t("settings.templateParity.field.missingInCounterpart")}</p>
              <p className="mt-1 text-xs text-amber-100">{report.missingInCounterpart.join(", ")}</p>
            </div>
          ) : null}

          {report.missingInCurrent.length ? (
            <div>
              <p className="text-xs font-semibold text-amber-100">{t("settings.templateParity.field.missingInCurrent")}</p>
              <p className="mt-1 text-xs text-amber-100">{report.missingInCurrent.join(", ")}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
