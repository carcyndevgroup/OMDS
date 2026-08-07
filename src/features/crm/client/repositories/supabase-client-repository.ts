import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import type { Json } from "@/core/supabase/json.types";

import type { ClientRepository } from "./client-repository";
import { listClientSummaries } from "./client-list-query";
import { findClientDetail } from "./client-detail-query";

export function createSupabaseClientRepository(
  client: SupabaseClient<Database>,
): ClientRepository {
  return {
    async createClientEvent(values, sourceLeadId) {
      const input = {
        ...values,
        venueId: values.venueId === "custom" ? "" : values.venueId,
        venueSubLocationId:
          values.venueSubLocationId === "custom" ? "" : values.venueSubLocationId,
      };
      const result = await client.rpc("create_client_event", {
        input: input as unknown as Json,
        source_lead_id: sourceLeadId ?? null,
      });

      if (result.error) throw result.error;

      const created = result.data[0];
      if (!created) throw new Error("client_event_creation_failed");

      return {
        clientId: created.client_id,
        eventId: created.event_id,
      };
    },
    findClientById: (id) => findClientDetail(client, id),
    listClients: (includeArchived = false) => listClientSummaries(client, includeArchived),
    async updateClientEvent(clientId, eventId, values) {
      const input = {
        ...values,
        venueId: values.venueId === "custom" ? "" : values.venueId,
        venueSubLocationId:
          values.venueSubLocationId === "custom" ? "" : values.venueSubLocationId,
      };
      const result = await client.rpc("update_client_event", {
        input: input as unknown as Json,
        target_client_id: clientId,
        target_event_id: eventId,
      });

      if (result.error) throw result.error;
    },
  };
}
