import type { EmailAdapter } from "./email-adapter";
import { readEmailConnectionConfig, type EmailConnectionConfig, type EmailEnvironment } from "./email-connection-config";
import { ImapSmtpEmailAdapter } from "./imap-smtp-email-adapter";

export type EmailAdapterStatus =
  | { configured: false; reason: "missing_configuration" }
  | { configured: true; reason: "ready" };

export type EmailAdapterFactoryResult = {
  adapter: EmailAdapter | null;
  config: EmailConnectionConfig | null;
  status: EmailAdapterStatus;
};

export function getEmailAdapter(env: EmailEnvironment = process.env): EmailAdapterFactoryResult {
  try {
    const config = readEmailConnectionConfig(env);
    return { adapter: new ImapSmtpEmailAdapter(config), config, status: { configured: true, reason: "ready" } };
  } catch {
    return { adapter: null, config: null, status: { configured: false, reason: "missing_configuration" } };
  }
}
