"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";
import { createBrowserSupabaseClient } from "@/core/supabase/browser-client";

type SignOutButtonProps = {
  isCollapsed?: boolean;
};

export function SignOutButton({ isCollapsed = false }: SignOutButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      aria-label={t("auth.signOut")}
      className={[
        "flex h-9 w-full items-center rounded-md text-sm font-semibold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white",
        isCollapsed ? "justify-center px-0" : "gap-2.5 px-3",
      ].join(" ")}
      onClick={() => void handleSignOut()}
      type="button"
    >
      <LogOut aria-hidden="true" size={17} />
      <span className={isCollapsed ? "sr-only" : ""}>{t("auth.signOut")}</span>
    </button>
  );
}
