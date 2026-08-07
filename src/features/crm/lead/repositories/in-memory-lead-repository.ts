import type { Lead } from "../types/lead";
import type { LeadRepository } from "./lead-repository";

export function createInMemoryLeadRepository(
  initialLeads: Lead[] = [],
): LeadRepository {
  const leads = new Map(initialLeads.map((lead) => [lead.id, lead]));

  return {
    async create(lead) {
      leads.set(lead.id, lead);
      return lead;
    },
    async delete(id) {
      return leads.delete(id);
    },
    async findById(id) {
      return leads.get(id) ?? null;
    },
    async list() {
      return Array.from(leads.values());
    },
    async update(lead) {
      leads.set(lead.id, lead);
      return lead;
    },
  };
}
