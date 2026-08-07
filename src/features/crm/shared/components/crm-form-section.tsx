import type { ReactNode } from "react";

type CrmFormSectionProps = {
  children: ReactNode;
  title: string;
};

export function CrmFormSection({ children, title }: CrmFormSectionProps) {
  return (
    <section className="space-y-5 border-t border-zinc-800 py-6 first:border-t-0 first:pt-0 last:pb-0">
      <h2 className="text-xl font-bold text-zinc-50">{title}</h2>
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
