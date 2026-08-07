import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

import type { ServiceFamily } from "../constants/service-options";
import type { Translate } from "../types/form-types";

type ServiceFamilyControlProps = {
  family: ServiceFamily;
  isOpen: boolean;
  onOpenChange: (familyId: string | null) => void;
  onToggle: (serviceId: string) => void;
  selectedIds: string[];
  t: Translate;
};

export function ServiceFamilyControl({
  family,
  isOpen,
  onOpenChange,
  onToggle,
  selectedIds,
  t,
}: ServiceFamilyControlProps) {
  const controlRef = useRef<HTMLDivElement>(null);
  const selectedCount = family.options.filter((option) => {
    return selectedIds.includes(option.id);
  }).length;

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) {
        onOpenChange(null);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen, onOpenChange]);

  return (
    <div
      className={`overflow-hidden rounded-md border bg-zinc-900 ${
        isOpen ? "border-cyan-400/50" : "border-zinc-700"
      }`}
      ref={controlRef}
    >
      <button
        aria-expanded={isOpen}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 text-left text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.04]"
        onClick={() => onOpenChange(isOpen ? null : family.id)}
        type="button"
      >
        <span className="min-w-0 truncate">{t(family.translationKey)}</span>
        <span className="flex shrink-0 items-center gap-2">
          {selectedCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded bg-cyan-300 px-1.5 text-xs font-bold text-zinc-950">
              {selectedCount}
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            size={17}
          />
        </span>
      </button>
      {isOpen ? (
        <div className="space-y-1 border-t border-zinc-700 bg-zinc-950/70 p-2">
          {family.options.map((option) => (
            <label
              className="flex min-h-10 cursor-pointer items-start gap-3 rounded px-2 py-2 text-sm leading-5 text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
              key={option.id}
            >
              <input
                checked={selectedIds.includes(option.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-300"
                onChange={() => onToggle(option.id)}
                type="checkbox"
              />
              <span>{t(option.translationKey)}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
