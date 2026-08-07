"use client";

import { useEffect, useState } from "react";

import type { Translate } from "../types/form-types";

type AuditEvent = { archived: boolean; changed_by: string; created_at: string };
type Props = { entity: "clients" | "leads"; id: string; t: Translate };

export function ArchiveAuditPanel({ entity, id, t }: Props) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/crm/archive/${entity}/${id}`)
      .then((response) => response.json() as Promise<{ data?: AuditEvent[] }>)
      .then((result) => {
        if (!cancelled) setEvents(result.data ?? []);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [entity, id]);

  if (events.length === 0) return null;

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-300">
        {t("crm.archive.audit.title")}
      </h2>
      <div className="mt-3 space-y-2">
        {events.map((event) => (
          <p className="text-sm text-zinc-400" key={`${event.created_at}-${event.changed_by}`}>
            <span className="font-semibold text-zinc-200">
              {t(event.archived ? "crm.archive.audit.archived" : "crm.archive.audit.unarchived")}
            </span>{" "}
            {new Date(event.created_at).toLocaleString()} · {event.changed_by}
          </p>
        ))}
      </div>
    </section>
  );
}