import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type PayrollLayoutProps = {
  children: ReactNode;
};

export default function PayrollLayout({ children }: PayrollLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
