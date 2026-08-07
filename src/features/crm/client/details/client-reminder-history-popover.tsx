"use client";

import { History } from "lucide-react";

import type { ReminderHistoryEntry } from "./client-reminder-messages";
import { ClientIconPopover } from "./client-icon-popover";

type ReminderHistoryPopoverProps = {
  ariaLabel: string;
  heading: string;
  history: ReminderHistoryEntry[];
  locale: "en" | "es";
};

export function ReminderHistoryPopover(props: ReminderHistoryPopoverProps) {
  const { ariaLabel, heading, history, locale } = props;
  const lines = history.slice(0, 5).map((entry) => (
    `${formatDateTime(entry.sentAt, locale)}${entry.actorEmail ? ` - ${entry.actorEmail}` : ""}`
  ));

  return (
    <ClientIconPopover
      ariaLabel={ariaLabel}
      heading={heading}
      icon={<History aria-hidden="true" size={12} />}
      lines={lines}
    />
  );
}

function formatDateTime(value: string, locale: "en" | "es") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
