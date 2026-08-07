import type { TranslationKey } from "@/core/i18n";

import type { BookingStatus } from "../../shared/types/crm-options";
import type { BookingType } from "../types/client";

type ClientOption<TValue extends string> = {
  translationKey: TranslationKey;
  value: TValue;
};

export const bookingTypeOptions: ClientOption<BookingType>[] = [
  { translationKey: "crm.client.option.direct", value: "direct" },
  {
    translationKey: "crm.client.option.preferredVendor",
    value: "preferred_vendor",
  },
];

export const bookingStatusOptions: ClientOption<BookingStatus>[] = [
  {
    translationKey: "crm.client.bookingStatus.quoteRequested",
    value: "quote_requested",
  },
  {
    translationKey: "crm.client.bookingStatus.proposalSent",
    value: "proposal_sent",
  },
  {
    translationKey: "crm.client.bookingStatus.tentativeHold",
    value: "tentative_hold",
  },
  {
    translationKey: "crm.client.bookingStatus.confirmed",
    value: "confirmed",
  },
  {
    translationKey: "crm.client.bookingStatus.cancelled",
    value: "cancelled",
  },
  {
    translationKey: "crm.client.bookingStatus.lost",
    value: "lost",
  },
];
