import type { ReactNode } from "react";

type VenueDetailSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function VenueDetailSection({
  children,
  description,
  title,
}: VenueDetailSectionProps) {
  return (
    <section className="border-b border-zinc-800 last:border-b-0">
      <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-bold">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm font-medium text-zinc-500">{description}</p>
        ) : null}
      </div>
      <dl className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">{children}</dl>
    </section>
  );
}
