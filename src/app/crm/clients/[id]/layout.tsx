import type { ReactNode } from "react";

import { ClientWorkspace } from "@/features/crm/client/details/client-workspace";

type ClientLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export default function ClientLayout({ children, params }: ClientLayoutProps) {
  return <ClientWorkspace id={params.id}>{children}</ClientWorkspace>;
}
