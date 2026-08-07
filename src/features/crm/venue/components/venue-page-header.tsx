import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

type VenuePageHeaderProps = {
  backLabel: string;
  editHref?: string;
  editLabel?: string;
  subtitle?: string;
  title: string;
};

export function VenuePageHeader(props: VenuePageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          aria-label={props.backLabel}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.05] hover:text-white"
          href="/crm/venues"
        >
          <ArrowLeft aria-hidden="true" size={21} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold sm:text-4xl">{props.title}</h1>
          {props.subtitle ? (
            <p className="mt-2 text-sm text-zinc-400">{props.subtitle}</p>
          ) : null}
        </div>
      </div>
      {props.editHref && props.editLabel ? (
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 hover:bg-cyan-200"
          href={props.editHref}
        >
          <Pencil aria-hidden="true" size={17} />
          {props.editLabel}
        </Link>
      ) : null}
    </header>
  );
}
