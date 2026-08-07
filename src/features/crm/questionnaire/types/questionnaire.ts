import type { Locale } from "@/core/i18n";
import type { Json } from "@/core/supabase/json.types";

export type QuestionnaireStatus = "draft" | "sent" | "submitted";
export type QuestionnaireReviewStatus =
  | "approved"
  | "not_started"
  | "pending_review"
  | "rejected";

export type Questionnaire = {
  appliedAt: string | null;
  applyNotes: string;
  createdAt: string;
  eventId: string;
  id: string;
  internalChangeNotes: string;
  locale: Locale;
  responseData: Json;
  reviewNotes: string;
  reviewStatus: QuestionnaireReviewStatus;
  reviewedAt: string | null;
  sentAt: string | null;
  status: QuestionnaireStatus;
  submittedAt: string | null;
  templateKey: string;
  title: string;
  updatedAt: string;
};

export type QuestionnaireAction =
  | "apply_approved"
  | "approve_review"
  | "create"
  | "reject_review"
  | "send"
  | "submit";
