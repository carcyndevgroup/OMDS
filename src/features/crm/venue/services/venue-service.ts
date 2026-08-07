import type { VenueRepository } from "../repositories/venue-repository";
import { validateVenueForm } from "../schemas/venue-schema";
import type { VenueFormValues } from "../types/venue";

export function createVenueService(repository: VenueRepository) {
  const create = async (values: VenueFormValues) => {
    const validation = validateVenueForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    return { ok: true, venue: await repository.create(values) } as const;
  };

  const update = async (id: string, values: VenueFormValues) => {
    const validation = validateVenueForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    const venue = await repository.update(id, values);
    return venue
      ? ({ ok: true, venue } as const)
      : ({ code: "venue_not_found", ok: false } as const);
  };

  return {
    create,
    findById: repository.findById,
    list: repository.list,
    update,
    updateSettings: repository.updateSettings,
  };
}
