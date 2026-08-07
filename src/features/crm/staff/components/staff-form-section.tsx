import type { ReactNode } from "react";

type StaffFormSectionProps = {
  children: ReactNode;
  title: string;
};

export function StaffFormSection({ children, title }: StaffFormSectionProps) {
  return (
    <section className="space-y-4 border-t border-zinc-800 pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-black text-white">{title}</h2>
      {children}
    </section>
  );
}
