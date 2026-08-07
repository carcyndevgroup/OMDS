"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useTranslation, type Locale } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";
import { useClient } from "../hooks/use-client";
import type { ClientDetail } from "../types/client";
import { ClientDetailHeader } from "./client-detail-header";

type ClientWorkspaceValue = {
  id: string;
  client: ClientDetail;
  locale: Locale;
  refreshClient: () => Promise<void>;
  t: Translate;
};

const ClientWorkspaceContext = createContext<ClientWorkspaceValue | null>(null);

type ClientWorkspaceProps = {
  children: ReactNode;
  id: string;
};

export function ClientWorkspace({ children, id }: ClientWorkspaceProps) {
  const { locale, t } = useTranslation();
  const { client, hasError, isLoading, refresh } = useClient(id);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">
        {t("crm.client.detail.loading")}
      </main>
    );
  }

  if (hasError || !client) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">
        {t("crm.client.detail.loadError")}
      </main>
    );
  }

  const value = { client, id, locale, refreshClient: refresh, t };

  return (
    <ClientWorkspaceContext.Provider value={value}>
      <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <ClientDetailHeader {...value} />
          {children}
        </div>
      </main>
    </ClientWorkspaceContext.Provider>
  );
}

export function useClientWorkspace() {
  const value = useContext(ClientWorkspaceContext);
  if (!value) throw new Error("client_workspace_missing");
  return value;
}
