type TemplateSnippetDefinition = {
  body: string;
  subject?: string;
  titleKey:
    | "settings.templateSnippets.item.contractSummary"
    | "settings.templateSnippets.item.paymentReminder"
    | "settings.templateSnippets.item.documentChecklist"
    | "settings.templateSnippets.item.signatureBlock"
    | "settings.templateSnippets.item.followUp";
};

function contractClauseBlock(title: string, body: string) {
  return `<h2>${title}</h2><p>${body}</p>`;
}

type TemplateSnippetGroupDefinition = {
  id: string;
  labelKey:
    | "settings.templateSnippets.group.contract"
    | "settings.templateSnippets.group.payment"
    | "settings.templateSnippets.group.communication";
  snippets: readonly TemplateSnippetDefinition[];
};

export const templateSnippetGroups: readonly TemplateSnippetGroupDefinition[] = [
  {
    id: "contract",
    labelKey: "settings.templateSnippets.group.contract",
    snippets: [
      {
        body: contractClauseBlock(
          "Service Summary",
          [
            "Event: {{event.name}}",
            "Date: {{event.date}}",
            "Location: {{venue.name}}",
            "Guest Count: {{event.guestCount}}",
          ].join("<br>"),
        ),
        titleKey: "settings.templateSnippets.item.contractSummary",
      },
      {
        body: contractClauseBlock(
          "Required Documents",
          [
            "<ul><li>Signed contract</li><li>Payment confirmation</li><li>Venue access notes</li></ul>",
          ].join(""),
        ),
        titleKey: "settings.templateSnippets.item.documentChecklist",
      },
      {
        body: contractClauseBlock(
          "Accepted by",
          [
            "Client Name: {{client.fullName}}",
            "Date: {{event.date}}",
            "OMDS Representative: {{sender.name}}",
          ].join("<br>"),
        ),
        titleKey: "settings.templateSnippets.item.signatureBlock",
      },
    ],
  },
  {
    id: "payment",
    labelKey: "settings.templateSnippets.group.payment",
    snippets: [
      {
        body: contractClauseBlock(
          "Payment Reminder",
          [
            "Retainer: {{quote.retainer}}",
            "Balance: {{quote.balance}}",
            "Due Date: {{invoice.dueDate}}",
          ].join("<br>"),
        ),
        subject: "Payment Reminder - {{event.name}}",
        titleKey: "settings.templateSnippets.item.paymentReminder",
      },
    ],
  },
  {
    id: "communication",
    labelKey: "settings.templateSnippets.group.communication",
    snippets: [
      {
        body: [
          "Hi {{client.fullName}},",
          "",
          "Thank you again for your trust in OMDS. We are sharing an update for {{event.name}}.",
          "If you have any questions, reply to this email and we will support you right away.",
          "",
          "Best regards,",
          "{{sender.name}}",
        ].join("\n"),
        subject: "Update for {{event.name}}",
        titleKey: "settings.templateSnippets.item.followUp",
      },
    ],
  },
] as const;

export function appendTemplateSnippet(value: string, snippet: string) {
  const trimmed = value.trim();
  if (!trimmed) return snippet;

  const separator = value.endsWith("\n") ? "\n" : "\n\n";
  return `${value}${separator}${snippet}`;
}
