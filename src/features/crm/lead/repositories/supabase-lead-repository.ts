import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { Lead } from "../types/lead";
import type { LeadRepository } from "./lead-repository";
import { toLead, toLeadInsert } from "./lead-record-mapper";

type LeadServiceMap = Map<string, string[]>;

const groupServices = (
  rows: { lead_id: string; service_id: string }[],
): LeadServiceMap => {
  const services = new Map<string, string[]>();

  rows.forEach((row) => {
    const currentIds = services.get(row.lead_id) ?? [];
    services.set(row.lead_id, [...currentIds, row.service_id]);
  });

  return services;
};

export function createSupabaseLeadRepository(
  client: SupabaseClient<Database>,
): LeadRepository {
  const replaceServices = async (lead: Lead) => {
    const deletion = await client
      .from("lead_services")
      .delete()
      .eq("lead_id", lead.id);

    if (deletion.error) throw deletion.error;
    if (lead.serviceIds.length === 0) return;

    const rows = lead.serviceIds.map((serviceId) => ({
      lead_id: lead.id,
      service_id: serviceId,
    }));
    const insertion = await client.from("lead_services").insert(rows);
    if (insertion.error) throw insertion.error;
  };

  return {
    async create(lead) {
      const result = await client.from("leads").insert(toLeadInsert(lead));
      if (result.error) throw result.error;

      try {
        await replaceServices(lead);
      } catch (error) {
        await client.from("leads").delete().eq("id", lead.id);
        throw error;
      }

      return lead;
    },
    async delete(id) {
      const result = await client
        .from("leads")
        .delete({ count: "exact" })
        .eq("id", id);

      if (result.error) throw result.error;
      return (result.count ?? 0) > 0;
    },
    async findById(id) {
      const leadResult = await client
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (leadResult.error) throw leadResult.error;
      if (!leadResult.data) return null;

      const servicesResult = await client
        .from("lead_services")
        .select("service_id")
        .eq("lead_id", id);

      if (servicesResult.error) throw servicesResult.error;
      return toLead(
        leadResult.data,
        servicesResult.data.map((row) => row.service_id),
      );
    },
    async list(includeArchived = false) {
      let leadQuery = client
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeArchived) leadQuery = leadQuery.is("archived_at", null);
      const leadResult = await leadQuery;

      if (leadResult.error) throw leadResult.error;
      if (leadResult.data.length === 0) return [];

      const leadIds = leadResult.data.map((lead) => lead.id);
      const servicesResult = await client
        .from("lead_services")
        .select("*")
        .in("lead_id", leadIds);

      if (servicesResult.error) throw servicesResult.error;
      const services = groupServices(servicesResult.data);

      return leadResult.data.map((row) => {
        return toLead(row, services.get(row.id) ?? []);
      });
    },
    async update(lead) {
      const result = await client
        .from("leads")
        .update(toLeadInsert(lead))
        .eq("id", lead.id);

      if (result.error) throw result.error;
      await replaceServices(lead);
      return lead;
    },
  };
}
