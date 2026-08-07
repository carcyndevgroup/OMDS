import type { ReactNode } from "react";

import { ClientWorkspace } from "@/features/crm/client/details/client-workspace";

type ClientLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ClientLayout(props: ClientLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  return <ClientWorkspace id={params.id}>{children}</ClientWorkspace>;
}
