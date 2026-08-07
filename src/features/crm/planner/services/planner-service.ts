import type { PlannerRepository } from "../repositories/planner-repository";
import { validatePlannerForm } from "../schemas/planner-schema";
import type { PlannerFormValues } from "../types/planner";

export function createPlannerService(repository: PlannerRepository) {
  const create = async (values: PlannerFormValues) => {
    const validation = validatePlannerForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    return { ok: true, planner: await repository.create(values) } as const;
  };

  const update = async (id: string, values: PlannerFormValues) => {
    const validation = validatePlannerForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    const planner = await repository.update(id, values);
    return planner
      ? ({ ok: true, planner } as const)
      : ({ code: "planner_not_found", ok: false } as const);
  };

  return {
    create,
    findById: repository.findById,
    list: repository.list,
    update,
  };
}
