export type EmailAddress = {
  address: string;
  name?: string;
};

export type EmailAttachment = {
  content: Uint8Array;
  contentType: string;
  fileName: string;
};

export type InboundEmail = {
  attachments: EmailAttachment[];
  bodyHtml?: string;
  bodyText: string;
  from: EmailAddress;
  inReplyTo?: string;
  messageId: string;
  references: string[];
  receivedAt: string;
  subject: string;
  to: EmailAddress[];
};

export type OutboundEmail = {
  attachments?: EmailAttachment[];
  bodyHtml?: string;
  bodyText: string;
  from: EmailAddress;
  inReplyTo?: string;
  subject: string;
  to: EmailAddress[];
};

export type EmailSyncResult = {
  emails: InboundEmail[];
  nextCursor?: string;
};

export interface EmailAdapter {
  send(message: OutboundEmail): Promise<{ providerMessageId: string }>;
  sync(cursor?: string): Promise<EmailSyncResult>;
}
