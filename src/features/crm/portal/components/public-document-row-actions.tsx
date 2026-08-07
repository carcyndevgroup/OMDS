import { Download, Eye } from "lucide-react";
import Link from "next/link";

type PublicDocumentRowActionsProps = {
  canDownload: boolean;
  downloadHref: string;
  downloadLabel: string;
  viewHref: string;
  viewLabel: string;
};

export function PublicDocumentRowActions(props: PublicDocumentRowActionsProps) {
  const { canDownload, downloadHref, downloadLabel, viewHref, viewLabel } = props;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-100 transition hover:border-cyan-300 hover:text-cyan-200"
        href={viewHref}
      >
        <Eye aria-hidden="true" size={14} />
        {viewLabel}
      </Link>
      {canDownload ? (
        <a
          className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-xs font-black text-zinc-950 transition hover:bg-cyan-200"
          href={downloadHref}
        >
          <Download aria-hidden="true" size={14} />
          {downloadLabel}
        </a>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500">
          <Download aria-hidden="true" size={14} />
          {downloadLabel}
        </span>
      )}
    </div>
  );
}
