import type { ReactNode } from "react";

type LeadDetailFieldProps = {
  children: ReactNode;
  hideLabel?: boolean;
  label: string;
};

export function LeadDetailField({
  children,
  hideLabel = false,
  label,
}: LeadDetailFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <dt
        className={
          hideLabel
            ? "sr-only"
            : "text-xs font-bold uppercase tracking-[0.12em] text-zinc-500"
        }
      >
        {label}
      </dt>
      <dd className="text-sm font-semibold leading-6 text-zinc-200">
        {children}
      </dd>
    </div>
  );
}
