import type { Planner, PlannerFormValues } from "../types/planner";

export type PlannerRepository = {
  create: (values: PlannerFormValues) => Promise<Planner>;
  findById: (id: string) => Promise<Planner | null>;
  list: () => Promise<Planner[]>;
  update: (id: string, values: PlannerFormValues) => Promise<Planner | null>;
};
