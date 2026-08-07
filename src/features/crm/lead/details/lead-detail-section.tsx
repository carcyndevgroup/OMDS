import type { ReactNode } from "react";

type LeadDetailSectionProps = {
  children: ReactNode;
  title: string;
};

export function LeadDetailSection({
  children,
  title,
}: LeadDetailSectionProps) {
  return (
    <section className="border-t border-zinc-800 first:border-t-0">
      <header className="border-b border-zinc-800 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-zinc-50">{title}</h2>
      </header>
      <dl className="grid gap-x-6 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
        {children}
      </dl>
    </section>
  );
}
