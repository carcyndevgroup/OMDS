export type EmailConnectionConfig = {
  address: string;
  imap: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
};

export type EmailEnvironment = Readonly<Record<string, string | undefined>>;

const required = (name: string, value: string | undefined) => {
  if (!value) throw new Error(`Missing required email configuration: ${name}`);
  return value;
};

const port = (name: string, value: string | undefined, fallback: string) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`Invalid email port: ${name}`);
  return parsed;
};

const boolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value === "true";
};

export function readEmailConnectionConfig(env: EmailEnvironment = process.env): EmailConnectionConfig {
  const address = required("EMAIL_ADDRESS", env.EMAIL_ADDRESS);
  const username = required("EMAIL_IMAP_USERNAME", env.EMAIL_IMAP_USERNAME);
  const password = required("EMAIL_IMAP_PASSWORD", env.EMAIL_IMAP_PASSWORD);
  const smtpUsername = env.EMAIL_SMTP_USERNAME || username;
  const smtpPassword = env.EMAIL_SMTP_PASSWORD || password;

  return {
    address,
    imap: {
      host: required("EMAIL_IMAP_HOST", env.EMAIL_IMAP_HOST),
      port: port("EMAIL_IMAP_PORT", env.EMAIL_IMAP_PORT, "993"),
      secure: boolean(env.EMAIL_IMAP_SECURE, true),
      username,
      password,
    },
    smtp: {
      host: required("EMAIL_SMTP_HOST", env.EMAIL_SMTP_HOST),
      port: port("EMAIL_SMTP_PORT", env.EMAIL_SMTP_PORT, "465"),
      secure: boolean(env.EMAIL_SMTP_SECURE, true),
      username: smtpUsername,
      password: smtpPassword,
    },
  };
}
