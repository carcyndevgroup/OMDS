import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type SatFacturasLayoutProps = {
  children: ReactNode;
};

export default function SatFacturasLayout({ children }: SatFacturasLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
