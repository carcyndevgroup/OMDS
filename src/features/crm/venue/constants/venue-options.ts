import type { TranslationKey } from "@/core/i18n";

export const venueAreaOptions = [
  { translationKey: "crm.venue.area.playaCostaMujeres", value: "playa_costa_mujeres" },
  { translationKey: "crm.venue.area.cancunZh", value: "cancun_zh" },
  { translationKey: "crm.venue.area.cancun", value: "cancun" },
  { translationKey: "crm.venue.area.puertoMorelos", value: "puerto_morelos" },
  { translationKey: "crm.venue.area.playaDelCarmen", value: "playa_del_carmen" },
  { translationKey: "crm.venue.area.puertoAventuras", value: "puerto_aventuras" },
  { translationKey: "crm.venue.area.akumal", value: "akumal" },
  { translationKey: "crm.venue.area.tulum", value: "tulum" },
  { translationKey: "crm.venue.area.islaMujeres", value: "isla_mujeres" },
  { translationKey: "crm.venue.area.cozumel", value: "cozumel" },
  { translationKey: "crm.venue.area.other", value: "other" },
] satisfies { translationKey: TranslationKey; value: string }[];

export const venueStatusOptions = [
  { translationKey: "crm.venue.status.active", value: "active" },
  { translationKey: "crm.venue.status.inactive", value: "inactive" },
] satisfies { translationKey: TranslationKey; value: "active" | "inactive" }[];
