import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type SettingsLayoutProps = {
  children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
