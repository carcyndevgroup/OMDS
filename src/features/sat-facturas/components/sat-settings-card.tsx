import type { ReactNode } from "react";

type SatSettingsCardProps = {
  children: ReactNode;
  inactiveLabel: string;
  isActive: boolean;
  subtitle: string;
  title: string;
};

export function SatSettingsCard({
  children,
  inactiveLabel,
  isActive,
  subtitle,
  title,
}: SatSettingsCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-200">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-zinc-500">{subtitle}</p>
        </div>
        {!isActive ? (
          <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400">
            {inactiveLabel}
          </span>
        ) : null}
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">{children}</dl>
    </article>
  );
}

export function SatSettingsField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-wider text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-zinc-200">{value}</dd>
    </div>
  );
}
