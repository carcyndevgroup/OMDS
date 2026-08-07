import type { SigningProfile } from "../types/signing-profile";
import { initialSigningProfile } from "./signing-profile-schema";

const readString = (source: unknown, key: keyof SigningProfile) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseSigningProfile(source: unknown): SigningProfile {
  return {
    authorizedSignerFullName:
      readString(source, "authorizedSignerFullName") || initialSigningProfile.authorizedSignerFullName,
    authorizedSignerTitle:
      readString(source, "authorizedSignerTitle") || initialSigningProfile.authorizedSignerTitle,
  };
}
