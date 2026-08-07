"use client";

import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

type ClientIconPopoverProps = {
  ariaLabel: string;
  heading?: string;
  icon: ReactNode;
  lines: string[];
};

export function ClientIconPopover(props: ClientIconPopoverProps) {
  const { ariaLabel, heading, icon, lines } = props;
  const panelId = useId();
  const headingId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [focusPanelOnOpen, setFocusPanelOnOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = panelRef.current?.offsetWidth ?? 280;
      const left = Math.max(12, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 12));
      const top = rect.bottom + 8;
      setPosition({ left, top });
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !focusPanelOnOpen) return;
    panelRef.current?.focus();
    setFocusPanelOnOpen(false);
  }, [focusPanelOnOpen, isOpen]);

  if (lines.length === 0) return null;

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setFocusPanelOnOpen(true);
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        aria-label={ariaLabel}
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-keyshortcuts="Escape"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-cyan-300 hover:text-cyan-200"
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onTriggerKeyDown}
        onMouseEnter={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        {icon}
      </button>
      {isOpen ? (
        <div
          aria-label={heading ? undefined : ariaLabel}
          aria-labelledby={heading ? headingId : undefined}
          className="fixed z-[70] w-80 max-w-[calc(100vw-1.5rem)] rounded-md border border-zinc-700 bg-zinc-950/95 p-2 shadow-xl backdrop-blur"
          id={panelId}
          onMouseLeave={() => setIsOpen(false)}
          ref={panelRef}
          tabIndex={-1}
          role="tooltip"
          style={{ left: `${position.left}px`, top: `${position.top}px` }}
        >
          {heading ? <p className="sr-only" id={headingId}>{heading}</p> : null}
          <div className="space-y-1">
            {lines.map((line, index) => (
              <p className="text-xs leading-5 text-zinc-100" key={`${line}-${index}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
