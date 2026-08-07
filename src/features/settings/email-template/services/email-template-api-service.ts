import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { EmailTemplateFormValues } from "../types/email-template";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  findEmailTemplate,
  getEmailTemplateUsageSummary,
  listEmailTemplateVersions,
  listEmailTemplates,
  rollbackEmailTemplateVersion,
  setEmailTemplateActive,
  updateEmailTemplate,
} from "../repositories/email-template-repository";

export async function createEmailTemplateApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: EmailTemplateFormValues) => createEmailTemplate(client, values),
    delete: (id: string) => deleteEmailTemplate(client, id),
    find: (id: string) => findEmailTemplate(client, id),
    getUsageSummary: (id: string) => getEmailTemplateUsageSummary(client, id),
    list: () => listEmailTemplates(client),
    listVersions: (id: string) => listEmailTemplateVersions(client, id),
    rollbackVersion: (id: string, versionId: string) => rollbackEmailTemplateVersion(client, id, versionId),
    setActive: (id: string, isActive: boolean) => setEmailTemplateActive(client, id, isActive),
    update: (id: string, values: EmailTemplateFormValues) => updateEmailTemplate(client, id, values),
  };
}
