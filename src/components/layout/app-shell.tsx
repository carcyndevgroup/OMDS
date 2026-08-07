"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { AppSidebar } from "./app-sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsSidebarCollapsed(
      window.localStorage.getItem("omds.sidebarCollapsed") === "true",
    );
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem("omds.sidebarCollapsed", String(nextValue));
      return nextValue;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={toggleSidebar}
        />
      </div>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 lg:hidden">
        <button
          aria-label={t("nav.open")}
          className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
          onClick={() => setIsNavigationOpen(true)}
          type="button"
        >
          <Menu aria-hidden="true" size={21} />
        </button>
        <span className="font-black text-white">{t("brand.shortName")}</span>
      </header>

      {isNavigationOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label={t("nav.close")}
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsNavigationOpen(false)}
            type="button"
          />
          <div className="relative h-full w-60">
            <AppSidebar onClose={() => setIsNavigationOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className={isSidebarCollapsed ? "lg:pl-20" : "lg:pl-60"}>
        {children}
      </div>
    </div>
  );
}
