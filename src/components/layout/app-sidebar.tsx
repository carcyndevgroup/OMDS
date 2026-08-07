"use client";

import { ChefHat, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/core/i18n";
import { sidebarNavigation } from "@/core/navigation/sidebar-navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

type AppSidebarProps = {
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapsed?: () => void;
};

export function AppSidebar({
  isCollapsed = false,
  onClose,
  onToggleCollapsed,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside
      className={[
        "flex h-full flex-col border-r border-zinc-800 bg-zinc-950 text-white transition-[width]",
        isCollapsed ? "w-20" : "w-60",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-16 shrink-0 items-center gap-3 border-b border-zinc-800 px-4",
          isCollapsed ? "justify-center px-2" : "",
        ].join(" ")}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-300 text-zinc-950">
          <ChefHat aria-hidden="true" size={19} />
        </span>
        <div className={isCollapsed ? "sr-only" : "min-w-0 flex-1"}>
          <p className="text-sm font-black tracking-normal">
            {t("brand.shortName")}
          </p>
          <p className="truncate text-[11px] text-zinc-500">{t("brand.name")}</p>
        </div>
        {onToggleCollapsed ? (
          <button
            aria-label={t(isCollapsed ? "nav.expand" : "nav.collapse")}
            className="hidden h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white lg:flex"
            onClick={onToggleCollapsed}
            type="button"
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" size={19} />
            ) : (
              <PanelLeftClose aria-hidden="true" size={19} />
            )}
          </button>
        ) : null}
        {onClose ? (
          <button
            aria-label={t("nav.close")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {sidebarNavigation.map((group, groupIndex) => (
          <div
            className="border-t border-zinc-800 py-2 first:border-t-0 first:pt-0"
            key={groupIndex}
          >
            {group.map(({ href, icon: Icon, labelKey }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  className={[
                    "mb-0.5 flex h-9 items-center rounded-md text-sm font-semibold transition",
                    isCollapsed ? "justify-center px-0" : "gap-2.5 px-3",
                    isActive
                      ? "bg-cyan-300 text-zinc-950"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                  href={href}
                  key={href}
                  onClick={onClose}
                  title={t(labelKey)}
                >
                  <Icon aria-hidden="true" size={17} />
                  <span className={isCollapsed ? "sr-only" : ""}>
                    {t(labelKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-zinc-800 p-2.5">
        <SignOutButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
