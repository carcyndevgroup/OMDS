import type { CompanyProfile } from "../types/company-profile";
import { initialCompanyProfile } from "./company-profile-schema";

const readString = (source: unknown, key: keyof CompanyProfile) => {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function parseCompanyProfile(source: unknown): CompanyProfile {
  return {
    legalName: readString(source, "legalName") || initialCompanyProfile.legalName,
    dbaName: readString(source, "dbaName") || initialCompanyProfile.dbaName,
    address: readString(source, "address") || initialCompanyProfile.address,
    phone: readString(source, "phone") || initialCompanyProfile.phone,
    email: readString(source, "email") || initialCompanyProfile.email,
    website: readString(source, "website") || initialCompanyProfile.website,
  };
}
