"use client";

import { Download, Eye } from "lucide-react";

type PublicDocumentActionsProps = {
  canDownload: boolean;
  downloadLabel: string;
  targetId: string;
  viewLabel: string;
};

export function PublicDocumentActions(props: PublicDocumentActionsProps) {
  const { canDownload, downloadLabel, targetId, viewLabel } = props;

  return (
    <div className="flex flex-wrap gap-2">
      <a
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-100 transition hover:border-cyan-300 hover:text-cyan-200"
        href={`#${targetId}`}
      >
        <Eye aria-hidden="true" size={16} />
        {viewLabel}
      </a>
      {canDownload ? (
        <button
          className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-black text-zinc-950 transition hover:bg-cyan-200"
          onClick={() => window.print()}
          type="button"
        >
          <Download aria-hidden="true" size={16} />
          {downloadLabel}
        </button>
      ) : null}
    </div>
  );
}
