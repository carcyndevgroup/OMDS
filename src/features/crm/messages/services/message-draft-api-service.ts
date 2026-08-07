import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createMessageDraft,
  listMessageDrafts,
  updateMessageDraftStatus,
} from "../repositories/message-draft-repository";
import type { MessageDraftCreateInput, MessageDraftStatus } from "../types/message-draft";

export async function createMessageDraftApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (eventId: string, input: MessageDraftCreateInput) => {
      const metadata =
        input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)
          ? input.metadata
          : {};

      return createMessageDraft(client, eventId, {
        ...input,
        metadata: {
          ...metadata,
          actorEmail: user.email ?? null,
          actorId: user.id,
        },
      });
    },
    list: (eventId: string) => listMessageDrafts(client, eventId),
    updateStatus: (eventId: string, messageId: string, status: MessageDraftStatus) =>
      updateMessageDraftStatus(client, eventId, messageId, status),
  };
}
