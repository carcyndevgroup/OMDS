import type { ReactNode } from "react";

type ClientDetailSectionProps = {
  children: ReactNode;
  title: string;
};

export function ClientDetailSection({
  children,
  title,
}: ClientDetailSectionProps) {
  return (
    <section className="overflow-visible rounded-md border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/10">
      <header className="border-b border-zinc-800 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
