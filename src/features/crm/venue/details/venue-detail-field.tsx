import type { ReactNode } from "react";

type VenueDetailFieldProps = {
  children: ReactNode;
  label: string;
};

export function VenueDetailField({ children, label }: VenueDetailFieldProps) {
  return (
    <div className="space-y-2">
      <dt className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="font-semibold text-zinc-200">{children}</dd>
    </div>
  );
}
