import type { LucideIcon } from "lucide-react";

type PayrollSummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function PayrollSummaryCard({ icon: Icon, label, value }: PayrollSummaryCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
          <Icon aria-hidden="true" size={22} />
        </div>
        <p className="text-right text-2xl font-black text-white">{value}</p>
      </div>
      <h2 className="mt-5 text-base font-black text-white">{label}</h2>
    </article>
  );
}
