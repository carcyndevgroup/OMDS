import type { Translate } from "@/features/crm/shared/types/form-types";

import type { QuoteVersionStatus } from "../types/quote";

export const statusKeys = {
  accepted: "crm.quote.status.accepted",
  declined: "crm.quote.status.declined",
  draft: "crm.quote.status.draft",
  expired: "crm.quote.status.expired",
  sent: "crm.quote.status.sent",
  superseded: "crm.quote.status.superseded",
  viewed: "crm.quote.status.viewed",
} as const satisfies Record<QuoteVersionStatus, Parameters<Translate>[0]>;
