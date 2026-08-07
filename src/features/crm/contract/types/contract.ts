import type { Locale } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";

export type ContractStatus = "draft" | "sent" | "signed" | "void";

export type ContractAction = "create" | "send" | "sign" | "void";

export type Contract = {
  contractData: Json;
  createdAt: string;
  eventId: string;
  id: string;
  internalNotes: string;
  legalSignatureName: string;
  locale: Locale;
  sentAt: string | null;
  signedAt: string | null;
  status: ContractStatus;
  templateKey: string;
  title: string;
  updatedAt: string;
  voidedAt: string | null;
};
