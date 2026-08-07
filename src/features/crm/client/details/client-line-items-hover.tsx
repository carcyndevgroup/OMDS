"use client";

import { List } from "lucide-react";

import { formatMoneyMxn } from "../../shared/utils/money-format";
import type { Translate } from "../../shared/types/form-types";
import { ClientIconPopover } from "./client-icon-popover";

type LineItemSummary = {
  description: string;
  details: string;
  lineTotalMxn: string;
  quantity: string;
};

export function buildLineItemsTooltip(items: LineItemSummary[], t: Translate) {
  if (items.length === 0) return t("crm.client.detail.empty.services");

  return items
    .map((item, index) => {
      const description = item.description.trim() || "-";
      const details = item.details.trim();
      const detailSuffix = details ? ` | ${details}` : "";
      return `${index + 1}. ${description} x${item.quantity} (${formatMoneyMxn(item.lineTotalMxn)})${detailSuffix}`;
    })
    .join("\n");
}

export function LineItemsHoverIcon(props: { ariaLabel: string; heading: string; tooltip: string }) {
  const lines = props.tooltip.split("\n").filter(Boolean);

  return (
    <ClientIconPopover
      ariaLabel={props.ariaLabel}
      heading={props.heading}
      icon={<List aria-hidden="true" size={12} />}
      lines={lines}
    />
  );
}
