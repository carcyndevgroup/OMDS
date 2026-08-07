type TemplateUsagePanelProps = {
  hasError: boolean;
  isLoading: boolean;
  loadingText: string;
  errorText: string;
  rows: Array<{ label: string; value: number }>;
  subtitle: string;
  title: string;
};

export function TemplateUsagePanel(props: TemplateUsagePanelProps) {
  const { errorText, hasError, isLoading, loadingText, rows, subtitle, title } = props;

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-bold text-cyan-200">{title}</h2>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>

      {isLoading ? <p className="mt-3 text-xs text-zinc-500">{loadingText}</p> : null}
      {hasError ? <p className="mt-3 text-xs text-rose-300">{errorText}</p> : null}

      {!isLoading && !hasError ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-3">
          {rows.map((row) => (
            <div className="rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2" key={row.label}>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{row.label}</dt>
              <dd className="mt-1 text-base font-black text-zinc-100">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
