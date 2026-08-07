import type { ReactNode } from "react";

type ClientDetailFieldProps = {
  children: ReactNode;
  label: string;
};

export function ClientDetailField({ children, label }: ClientDetailFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <dt className="text-xs font-bold uppercase text-zinc-500">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-zinc-200">{children}</dd>
    </div>
  );
}
