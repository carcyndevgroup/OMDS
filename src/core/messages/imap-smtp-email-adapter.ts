import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";

import type { EmailAdapter, EmailAddress, EmailAttachment, EmailSyncResult, InboundEmail, OutboundEmail } from "./email-adapter";
import type { EmailConnectionConfig } from "./email-connection-config";

const address = (value: { address?: string; name?: string } | undefined): EmailAddress => ({
  address: value?.address ?? "",
  ...(value?.name ? { name: value.name } : {}),
});

const attachments = (items: { content: Buffer; contentType: string; filename?: string }[]): EmailAttachment[] => {
  return items.map((item) => ({
    content: new Uint8Array(item.content),
    contentType: item.contentType,
    fileName: item.filename ?? "attachment",
  }));
};

export class ImapSmtpEmailAdapter implements EmailAdapter {
  private readonly smtp;

  constructor(private readonly config: EmailConnectionConfig) {
    this.smtp = nodemailer.createTransport({
      auth: { pass: config.smtp.password, user: config.smtp.username },
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
    });
  }

  async sync(cursor?: string): Promise<EmailSyncResult> {
    const client = new ImapFlow({
      auth: { pass: this.config.imap.password, user: this.config.imap.username },
      host: this.config.imap.host,
      port: this.config.imap.port,
      secure: this.config.imap.secure,
    });
    const emails: InboundEmail[] = [];
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const minimumUid = Number(cursor ?? "0");
        const range = minimumUid > 0 ? `${minimumUid + 1}:*` : "1:*";
        let maximumUid = minimumUid;
        for await (const message of client.fetch(range, { source: true, uid: true }, { uid: true })) {
          if (!message.source) continue;
          maximumUid = Math.max(maximumUid, message.uid);
          const parsed = await simpleParser(message.source);
          emails.push({
            attachments: attachments(parsed.attachments),
            bodyHtml: typeof parsed.html === "string" ? parsed.html : undefined,
            bodyText: parsed.text ?? "",
            from: address(parsed.from?.value[0]),
            messageId: parsed.messageId ?? `imap-${message.uid}`,
            receivedAt: (parsed.date ?? new Date()).toISOString(),
            subject: parsed.subject ?? "",
            threadId: parsed.references?.[0] ?? parsed.inReplyTo ?? undefined,
            to: parsed.to && !Array.isArray(parsed.to) ? parsed.to.value.map(address) : [],
          });
        }
        return { emails, ...(emails.length ? { nextCursor: String(maximumUid) } : {}) };
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async send(message: OutboundEmail): Promise<{ providerMessageId: string }> {
    const result = await this.smtp.sendMail({
      attachments: message.attachments?.map((item) => ({ content: Buffer.from(item.content), contentType: item.contentType, filename: item.fileName })),
      from: message.from.name ? { address: message.from.address, name: message.from.name } : message.from.address,
      html: message.bodyHtml,
      inReplyTo: message.inReplyTo,
      subject: message.subject,
      text: message.bodyText,
      to: message.to.map((item) => item.name ? { address: item.address, name: item.name } : item.address),
    });
    return { providerMessageId: result.messageId };
  }
}
