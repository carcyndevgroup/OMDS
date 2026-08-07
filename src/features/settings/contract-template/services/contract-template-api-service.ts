import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { ContractTemplateFormValues } from "../types/contract-template";
import {
  createContractTemplate,
  deleteContractTemplate,
  findContractTemplate,
  getContractTemplateUsageSummary,
  listContractTemplateVersions,
  listContractTemplates,
  rollbackContractTemplateVersion,
  setContractTemplateActive,
  updateContractTemplate,
} from "../repositories/contract-template-repository";

export async function createContractTemplateApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: ContractTemplateFormValues) => createContractTemplate(client, values),
    delete: (id: string) => deleteContractTemplate(client, id),
    find: (id: string) => findContractTemplate(client, id),
    getUsageSummary: (id: string) => getContractTemplateUsageSummary(client, id),
    list: () => listContractTemplates(client),
    listVersions: (id: string) => listContractTemplateVersions(client, id),
    rollbackVersion: (id: string, versionId: string) => rollbackContractTemplateVersion(client, id, versionId),
    setActive: (id: string, isActive: boolean) => setContractTemplateActive(client, id, isActive),
    update: (id: string, values: ContractTemplateFormValues) => updateContractTemplate(client, id, values),
  };
}
