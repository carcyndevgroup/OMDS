import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EmailTemplate,
  EmailTemplateFormValues,
  EmailTemplateVersion,
} from "../types/email-template";

type EmailTemplateRow = Database["public"]["Tables"]["email_templates"]["Row"];
type EmailTemplateVersionRow = Database["public"]["Tables"]["email_template_versions"]["Row"];

export const DEFAULT_TEMPLATE_DELETE_FORBIDDEN = "default_template_delete_forbidden";
export const TEMPLATE_IN_USE_DELETE_FORBIDDEN = "template_in_use_delete_forbidden";

export type EmailTemplateUsageSummary = {
  linkedRecords: number;
  messageDrafts: number;
  templateKey: string;
};

function createGuardedError(code: string) {
  const guardedError = new Error(code) as Error & { code: string };
  guardedError.code = code;
  return guardedError;
}

const toEmailTemplate = (row: EmailTemplateRow): EmailTemplate => ({
  body: row.body,
  createdAt: row.created_at,
  description: row.description,
  documentKind: row.document_kind,
  id: row.id,
  isActive: row.is_active,
  isDefault: row.is_default,
  subject: row.subject,
  templateKey: row.template_key,
  title: row.title,
  updatedAt: row.updated_at,
});

const toPayload = (values: EmailTemplateFormValues) => ({
  body: values.body.trim(),
  description: values.description.trim(),
  document_kind: values.documentKind,
  is_active: values.isActive,
  is_default: values.isDefault,
  subject: values.subject.trim(),
  template_key: values.templateKey.trim(),
  title: values.title.trim(),
});

const toEmailTemplateVersion = (row: EmailTemplateVersionRow): EmailTemplateVersion => ({
  body: row.body,
  createdAt: row.created_at,
  description: row.description,
  documentKind: row.document_kind,
  id: row.id,
  isActive: row.is_active,
  isDefault: row.is_default,
  subject: row.subject,
  templateId: row.template_id,
  templateKey: row.template_key,
  title: row.title,
  versionNumber: row.version_number,
});

async function getNextEmailTemplateVersionNumber(
  database: SupabaseClient<Database>,
  templateId: string,
) {
  const latestVersion = await database
    .from("email_template_versions")
    .select("version_number")
    .eq("template_id", templateId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestVersion.error) throw latestVersion.error;
  return (latestVersion.data?.version_number ?? 0) + 1;
}

async function snapshotEmailTemplateVersion(
  database: SupabaseClient<Database>,
  row: EmailTemplateRow,
) {
  const versionNumber = await getNextEmailTemplateVersionNumber(database, row.id);
  const result = await database.from("email_template_versions").insert({
    body: row.body,
    description: row.description,
    document_kind: row.document_kind,
    is_active: row.is_active,
    is_default: row.is_default,
    subject: row.subject,
    template_id: row.id,
    template_key: row.template_key,
    title: row.title,
    version_number: versionNumber,
  });
  if (result.error) throw result.error;
}

function hasEmailTemplateChanges(current: EmailTemplateRow, next: ReturnType<typeof toPayload>) {
  return (
    current.body !== next.body
    || current.description !== next.description
    || current.document_kind !== next.document_kind
    || current.is_active !== next.is_active
    || current.is_default !== next.is_default
    || current.subject !== next.subject
    || current.template_key !== next.template_key
    || current.title !== next.title
  );
}

export async function createEmailTemplate(
  database: SupabaseClient<Database>,
  values: EmailTemplateFormValues,
) {
  const result = await database.from("email_templates").insert(toPayload(values)).select("*").single();
  if (result.error) throw result.error;
  await snapshotEmailTemplateVersion(database, result.data);
  return toEmailTemplate(result.data);
}

export async function findEmailTemplate(database: SupabaseClient<Database>, id: string) {
  const result = await database.from("email_templates").select("*").eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toEmailTemplate(result.data) : null;
}

export async function listEmailTemplates(database: SupabaseClient<Database>) {
  const result = await database
    .from("email_templates")
    .select("*")
    .order("is_default", { ascending: false })
    .order("document_kind")
    .order("title");
  if (result.error) throw result.error;
  return result.data.map(toEmailTemplate);
}

export async function updateEmailTemplate(
  database: SupabaseClient<Database>,
  id: string,
  values: EmailTemplateFormValues,
) {
  const payload = toPayload(values);
  const existingResult = await database.from("email_templates").select("*").eq("id", id).maybeSingle();
  if (existingResult.error) throw existingResult.error;
  if (!existingResult.data) return null;

  if (hasEmailTemplateChanges(existingResult.data, payload)) {
    await snapshotEmailTemplateVersion(database, existingResult.data);
  }

  const result = await database.from("email_templates").update(payload).eq("id", id).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toEmailTemplate(result.data) : null;
}

export async function listEmailTemplateVersions(
  database: SupabaseClient<Database>,
  templateId: string,
) {
  const result = await database
    .from("email_template_versions")
    .select("*")
    .eq("template_id", templateId)
    .order("version_number", { ascending: false });
  if (result.error) throw result.error;
  return result.data.map(toEmailTemplateVersion);
}

export async function rollbackEmailTemplateVersion(
  database: SupabaseClient<Database>,
  templateId: string,
  versionId: string,
) {
  const versionResult = await database
    .from("email_template_versions")
    .select("*")
    .eq("id", versionId)
    .eq("template_id", templateId)
    .maybeSingle();
  if (versionResult.error) throw versionResult.error;
  if (!versionResult.data) return null;

  const restored = await updateEmailTemplate(database, templateId, {
    body: versionResult.data.body,
    description: versionResult.data.description,
    documentKind: versionResult.data.document_kind,
    isActive: versionResult.data.is_active,
    isDefault: versionResult.data.is_default,
    subject: versionResult.data.subject,
    templateKey: versionResult.data.template_key,
    title: versionResult.data.title,
  });

  return restored;
}

export async function setEmailTemplateActive(
  database: SupabaseClient<Database>,
  id: string,
  isActive: boolean,
) {
  const result = await database
    .from("email_templates")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? toEmailTemplate(result.data) : null;
}

export async function deleteEmailTemplate(database: SupabaseClient<Database>, id: string) {
  const templateResult = await database
    .from("email_templates")
    .select("template_key,is_default")
    .eq("id", id)
    .maybeSingle();
  if (templateResult.error) throw templateResult.error;

  if (templateResult.data?.is_default) {
    throw createGuardedError(DEFAULT_TEMPLATE_DELETE_FORBIDDEN);
  }

  if (templateResult.data?.template_key) {
    const messageUsageResult = await database
      .from("event_message_drafts")
      .select("id")
      .eq("metadata->>emailTemplate", templateResult.data.template_key)
      .limit(1)
      .maybeSingle();
    if (messageUsageResult.error) throw messageUsageResult.error;

    if (messageUsageResult.data) {
      throw createGuardedError(TEMPLATE_IN_USE_DELETE_FORBIDDEN);
    }
  }

  const result = await database.from("email_templates").delete().eq("id", id);
  if (result.error) throw result.error;
}

export async function getEmailTemplateUsageSummary(
  database: SupabaseClient<Database>,
  id: string,
) {
  const templateResult = await database
    .from("email_templates")
    .select("template_key")
    .eq("id", id)
    .maybeSingle();
  if (templateResult.error) throw templateResult.error;
  if (!templateResult.data?.template_key) return null;

  const templateKey = templateResult.data.template_key;

  const messageDraftsResult = await database
    .from("event_message_drafts")
    .select("id", { count: "exact", head: true })
    .eq("metadata->>emailTemplate", templateKey);
  if (messageDraftsResult.error) throw messageDraftsResult.error;

  const messageDrafts = messageDraftsResult.count ?? 0;
  return {
    linkedRecords: messageDrafts,
    messageDrafts,
    templateKey,
  } satisfies EmailTemplateUsageSummary;
}
