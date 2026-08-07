"use client";

import { useEffect, useId, useRef, useState } from "react";

type RowAction = {
  disabled?: boolean;
  href?: string;
  label: string;
  onClick?: () => void;
};

type ClientRowActionsMenuProps = {
  actions: RowAction[];
  label: string;
};

export function ClientRowActionsMenu(props: ClientRowActionsMenuProps) {
  const { actions, label } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const updatePosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 176;
    const menuHeight = menuRef.current?.offsetHeight ?? actions.length * 32 + 8;

    const minMargin = 8;
    const left = Math.max(
      minMargin,
      Math.min(window.innerWidth - menuWidth - minMargin, buttonRect.right - menuWidth),
    );

    const topAbove = buttonRect.top - menuHeight - 6;
    const topBelow = buttonRect.bottom + 6;
    const top = topAbove >= minMargin ? topAbove : topBelow;

    setPosition({ left, top });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const rafId = window.requestAnimationFrame(updatePosition);

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [actions.length, isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        className="inline-flex h-8 items-center rounded-md border border-zinc-700 px-3 text-xs font-bold text-zinc-200"
        onClick={() => setIsOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        {label}
      </button>
      {isOpen ? (
        <div
          className="fixed z-[100] min-w-44 rounded-md border border-zinc-800 bg-zinc-950 p-1 shadow-xl"
          id={menuId}
          ref={menuRef}
          style={{ left: `${position.left}px`, top: `${position.top}px` }}
        >
          {actions.map((action) => (
            <ActionItem
              action={action}
              key={action.label}
              onActionSelected={() => setIsOpen(false)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ActionItem(props: {
  action: RowAction;
  onActionSelected: () => void;
}) {
  const { action, onActionSelected } = props;
  const className = [
    "flex h-8 w-full items-center rounded px-2 text-left text-xs font-bold",
    action.disabled
      ? "cursor-not-allowed text-zinc-500"
      : "text-zinc-200 hover:bg-zinc-900 hover:text-cyan-200",
  ].join(" ");

  if (action.href && !action.disabled) {
      return (
        <a className={className} href={action.href}>
          {action.label}
        </a>
    );
  }

  return (
    <button
      className={className}
      disabled={action.disabled}
      onClick={() => {
        action.onClick?.();
        onActionSelected();
      }}
      type="button"
    >
      {action.label}
    </button>
  );
}
