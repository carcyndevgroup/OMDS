import { clientModule } from "./client";
import { leadModule } from "./lead/module";
import { plannerModule } from "./planner";
import { venueModule } from "./venue";

export const crmModules = [
  leadModule,
  clientModule,
  plannerModule,
  venueModule,
] as const;
