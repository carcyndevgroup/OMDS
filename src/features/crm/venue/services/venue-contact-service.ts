import type { VenueContactRepository } from "../repositories/venue-contact-repository";
import type { VenueContactFormValues } from "../types/venue-contact";

export function createVenueContactService(repository: VenueContactRepository) {
  return {
    create: (venueId: string, values: VenueContactFormValues) => {
      return repository.create(venueId, values);
    },
    listByVenue: (venueId: string) => repository.listByVenue(venueId),
    update: (
      venueId: string,
      contactId: string,
      values: VenueContactFormValues,
    ) => repository.update(venueId, contactId, values),
  };
}
