import { useEffect, useMemo, useState } from "react";

export type ListColumnConfig<TId extends string> = {
  id: TId;
  required?: boolean;
};

type SavedColumns<TId extends string> = {
  order: TId[];
  visible: TId[];
};

const isSavedColumns = <TId extends string>(
  value: unknown,
): value is SavedColumns<TId> => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedColumns<TId>>;
  return Array.isArray(candidate.order) && Array.isArray(candidate.visible);
};

export function useListColumns<TId extends string>(
  storageKey: string,
  columns: readonly ListColumnConfig<TId>[],
) {
  const defaultOrder = useMemo(() => columns.map((column) => column.id), [columns]);
  const requiredIds = useMemo(() => {
    return new Set(columns.filter((column) => column.required).map((column) => column.id));
  }, [columns]);
  const [order, setOrder] = useState<TId[]>(defaultOrder);
  const [visible, setVisible] = useState<TId[]>(defaultOrder);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null") as unknown;
    if (!isSavedColumns<TId>(saved)) return;

    const validOrder = saved.order.filter((id) => defaultOrder.includes(id));
    const missing = defaultOrder.filter((id) => !validOrder.includes(id));
    const savedVisible = saved.visible.filter((id) => defaultOrder.includes(id));

    setOrder([...validOrder, ...missing]);
    setVisible(Array.from(new Set([...savedVisible, ...Array.from(requiredIds)])));
  }, [defaultOrder, requiredIds, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ order, visible }));
  }, [order, storageKey, visible]);

  const orderedVisible = order.filter((id) => visible.includes(id));
  const toggleColumn = (id: TId) => {
    if (requiredIds.has(id)) return;
    setVisible((current) => (
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    ));
  };
  const moveColumn = (id: TId, direction: -1 | 1) => {
    setOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  return { moveColumn, order, orderedVisible, toggleColumn, visible };
}
