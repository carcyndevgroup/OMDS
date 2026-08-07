import type {
  VenueContact,
  VenueContactFormValues,
} from "../types/venue-contact";

export type VenueContactRepository = {
  create: (venueId: string, values: VenueContactFormValues) => Promise<VenueContact>;
  listByVenue: (venueId: string) => Promise<VenueContact[]>;
  update: (
    venueId: string,
    contactId: string,
    values: VenueContactFormValues,
  ) => Promise<VenueContact | null>;
};
