import {
  validateLeadForm,
  type LeadFormErrors,
} from "../schemas/lead-schema";
import type { Lead, LeadFormValues } from "../types/lead";
import type { LeadRepository } from "../repositories/lead-repository";

type LeadIdFactory = () => string;
type TimestampFactory = () => string;

type LeadServiceDependencies = {
  createId?: LeadIdFactory;
  now?: TimestampFactory;
  repository: LeadRepository;
};

type CreateLeadResult =
  | { errors: LeadFormErrors; lead?: never; ok: false }
  | { errors?: never; lead: Lead; ok: true };

type UpdateLeadResult =
  | CreateLeadResult
  | { code: "lead_not_found"; errors?: never; lead?: never; ok: false };

const createDefaultLeadId = () => {
  return globalThis.crypto?.randomUUID?.() ?? `lead_${Date.now().toString(36)}`;
};

const createTimestamp = () => {
  return new Date().toISOString();
};

export function createLeadService({
  createId = createDefaultLeadId,
  now = createTimestamp,
  repository,
}: LeadServiceDependencies) {
  const createLead = async (values: LeadFormValues): Promise<CreateLeadResult> => {
    const validation = validateLeadForm(values);

    if (!validation.isValid) {
      return { errors: validation.errors, ok: false };
    }

    const timestamp = now();
    const lead: Lead = {
      ...values,
      createdAt: timestamp,
      id: createId(),
      updatedAt: timestamp,
    };

    return { lead: await repository.create(lead), ok: true };
  };

  const updateLead = async (
    id: string,
    values: LeadFormValues,
  ): Promise<UpdateLeadResult> => {
    const validation = validateLeadForm(values);

    if (!validation.isValid) {
      return { errors: validation.errors, ok: false };
    }

    const currentLead = await repository.findById(id);
    if (!currentLead) return { code: "lead_not_found", ok: false };

    const lead: Lead = {
      ...values,
      createdAt: currentLead.createdAt,
      id,
      updatedAt: now(),
    };

    return { lead: await repository.update(lead), ok: true };
  };

  return {
    createLead,
    deleteLead: repository.delete,
    findLeadById: repository.findById,
    listLeads: (includeArchived = false) => repository.list(includeArchived),
    updateLead,
  };
}
