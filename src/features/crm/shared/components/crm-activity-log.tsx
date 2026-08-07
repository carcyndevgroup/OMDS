"use client";

import { ExternalLink, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { resolveActivityLabel } from "../services/activity-label";
import type { Translate } from "../types/form-types";

type Activity = {
  actor_id: string | null;
  created_at: string;
  event_type: string;
  id: string;
  linked_path: string | null;
  summary: string;
};

type Props = { entity: "clients" | "leads"; id: string; t: Translate };

export function CrmActivityLog({ entity, id, t }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    void fetch(`/api/crm/activity-log/${entity}/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("activity_log_load_failed");
        return response.json() as Promise<{ data?: Activity[] }>;
      })
      .then((result) => {
        if (!cancelled) {
          setActivities(result.data ?? []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [entity, id]);

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/10">
      <div className="flex items-center gap-2">
        <History aria-hidden="true" className="text-cyan-300" size={18} />
        <h2 className="text-lg font-bold text-white">{t("crm.activityLog.title")}</h2>
      </div>
      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-500">{t("crm.activityLog.loading")}</p>
      ) : hasError ? (
        <p className="mt-4 text-sm text-rose-300">{t("crm.activityLog.error")}</p>
      ) : activities.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{t("crm.activityLog.empty")}</p>
      ) : (
        <ol className="mt-4 space-y-3 border-l border-zinc-700 pl-4">
          {activities.map((activity) => (
            <li className="relative space-y-1" key={activity.id}>
              <p className="text-sm font-semibold text-zinc-200">
                {resolveActivityLabel(activity.event_type, activity.summary, t)}
              </p>
              <p className="text-xs text-zinc-500">
                {new Date(activity.created_at).toLocaleString()} · {activity.actor_id ?? t("crm.activityLog.system")}
              </p>
              {activity.linked_path ? (
                <Link className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-100" href={activity.linked_path}>
                  {t("crm.activityLog.openDetails")} <ExternalLink aria-hidden="true" size={13} />
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
