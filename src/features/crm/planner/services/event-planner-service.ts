import type { EventPlannerRepository } from "../repositories/event-planner-repository";
import { validateEventPlannerForm } from "../schemas/event-planner-schema";
import type { EventPlannerFormValues } from "../types/event-planner";

export function createEventPlannerService(repository: EventPlannerRepository) {
  const create = async (eventId: string, values: EventPlannerFormValues) => {
    const validation = validateEventPlannerForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    return { eventPlanner: await repository.create(eventId, values), ok: true } as const;
  };

  const update = async (
    eventId: string,
    eventPlannerId: string,
    values: EventPlannerFormValues,
  ) => {
    const validation = validateEventPlannerForm(values);
    if (!validation.isValid) return { errors: validation.errors, ok: false } as const;

    const eventPlanner = await repository.update(eventId, eventPlannerId, values);
    return eventPlanner
      ? ({ eventPlanner, ok: true } as const)
      : ({ code: "event_planner_not_found", ok: false } as const);
  };

  return {
    create,
    delete: repository.delete,
    listByEvent: repository.listByEvent,
    update,
  };
}
