import type { Locale } from "@/core/i18n";
import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createContract,
  listContracts,
  sendContract,
  signContract,
  voidContract,
} from "../repositories/contract-repository";

export async function createContractApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (eventId: string, locale: Locale) =>
      createContract(client, eventId, locale),
    list: (eventId: string) => listContracts(client, eventId),
    send: (contractId: string) => sendContract(client, contractId),
    sign: (contractId: string) => signContract(client, contractId),
    void: (contractId: string) => voidContract(client, contractId),
  };
}
