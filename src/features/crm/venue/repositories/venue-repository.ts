import type {
  Venue,
  VenueFormValues,
  VenueSettingsFormValues,
} from "../types/venue";

export type VenueRepository = {
  create: (values: VenueFormValues) => Promise<Venue>;
  findById: (id: string) => Promise<Venue | null>;
  list: () => Promise<Venue[]>;
  update: (id: string, values: VenueFormValues) => Promise<Venue | null>;
  updateSettings: (
    id: string,
    values: VenueSettingsFormValues,
  ) => Promise<Venue | null>;
};
