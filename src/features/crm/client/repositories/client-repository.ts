import type {
  ClientDetail,
  ClientFormValues,
  ClientListItem,
} from "../types/client";

export type ClientEventIds = {
  clientId: string;
  eventId: string;
};

export type ClientRepository = {
  createClientEvent: (
    values: ClientFormValues,
    sourceLeadId?: string,
  ) => Promise<ClientEventIds>;
  findClientById: (id: string) => Promise<ClientDetail | null>;
  listClients: (includeArchived?: boolean) => Promise<ClientListItem[]>;
  updateClientEvent: (
    clientId: string,
    eventId: string,
    values: ClientFormValues,
  ) => Promise<void>;
};
