import type { VenueDraft } from "../types/venue-draft";

const normalizeVenueName = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase()
  .replace(/[^a-z0-9]+/g, "")
  .trim();

async function findExistingVenue(name: string) {
  const response = await fetch("/api/crm/venues");
  if (!response.ok) return null;

  const payload = await response.json() as { data?: Array<{ id: string; name: string }> };
  const normalizedName = normalizeVenueName(name);
  return payload.data?.find(
    (venue) => normalizeVenueName(venue.name) === normalizedName,
  ) ?? null;
}

export async function resolveVenueDraft(
  venueId: string,
  venueDraft: VenueDraft | null,
) {
  if (venueId || !venueDraft) return venueId;

  const existingVenue = await findExistingVenue(venueDraft.name);
  if (existingVenue) return existingVenue.id;

  const response = await fetch("/api/crm/venues", {
    body: JSON.stringify({
      ...venueDraft,
      area: "other",
      internalStatus: "active",
      isPreferredVendor: false,
      requiresSatFiscal: false,
      usesSubLocations: false,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) {
    const duplicateVenue = await findExistingVenue(venueDraft.name);
    if (duplicateVenue) return duplicateVenue.id;
    throw new Error(`venue_create_failed_${response.status}`);
  }

  const payload = await response.json() as { data?: { id?: string } };
  if (!payload.data?.id) throw new Error("venue_create_failed");
  return payload.data.id;
}