import { useState } from "react";

type ArchiveEntity = "clients" | "leads";

export function useArchiveRecord(entity: ArchiveEntity, id: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const setArchived = async (archived: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/crm/archive/${entity}/${id}`, {
        body: JSON.stringify({ archived }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("archive_update_failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, setArchived };
}