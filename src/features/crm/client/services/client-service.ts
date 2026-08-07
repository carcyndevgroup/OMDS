import type { ClientFormErrors } from "../schemas/client-schema";
import { validateClientForm } from "../schemas/client-schema";
import type {
  ClientEventIds,
  ClientRepository,
} from "../repositories/client-repository";
import type { ClientFormValues } from "../types/client";

type ClientServiceDependencies = {
  repository: ClientRepository;
};

type CreateClientEventResult =
  | { errors: ClientFormErrors; ids?: never; ok: false }
  | { errors?: never; ids: ClientEventIds; ok: true };

export function createClientService({
  repository,
}: ClientServiceDependencies) {
  const createClientEvent = async (
    values: ClientFormValues,
    sourceLeadId?: string,
  ): Promise<CreateClientEventResult> => {
    const validation = validateClientForm(values);

    if (!validation.isValid) {
      return { errors: validation.errors, ok: false };
    }

    const ids = await repository.createClientEvent(values, sourceLeadId);
    return { ids, ok: true };
  };

  const listClients = (includeArchived = false) => repository.listClients(includeArchived);
  const findClientById = (id: string) => repository.findClientById(id);
  const updateClientEvent = async (
    clientId: string,
    eventId: string,
    values: ClientFormValues,
  ) => {
    const validation = validateClientForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    await repository.updateClientEvent(clientId, eventId, values);
    return { ok: true } as const;
  };

  return {
    createClientEvent,
    findClientById,
    listClients,
    updateClientEvent,
  };
}
