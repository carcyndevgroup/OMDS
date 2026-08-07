import type {
  EventPlanner,
  EventPlannerFormValues,
} from "../types/event-planner";

export type EventPlannerRepository = {
  create: (eventId: string, values: EventPlannerFormValues) => Promise<EventPlanner>;
  delete: (eventId: string, eventPlannerId: string) => Promise<void>;
  listByEvent: (eventId: string) => Promise<EventPlanner[]>;
  update: (
    eventId: string,
    eventPlannerId: string,
    values: EventPlannerFormValues,
  ) => Promise<EventPlanner | null>;
};
