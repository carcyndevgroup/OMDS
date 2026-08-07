import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventEquipmentAssignment,
  EventEquipmentFormValues,
} from "../types/event-equipment";

type AssignmentRow =
  Database["public"]["Tables"]["event_equipment_assignments"]["Row"];
type EquipmentRow = Pick<
  Database["public"]["Tables"]["equipment_catalog"]["Row"],
  "category" | "id" | "name"
>;

export function mapEventEquipmentAssignments(
  assignments: AssignmentRow[],
  equipmentById: Map<string, EquipmentRow>,
): EventEquipmentAssignment[] {
  return assignments.map((assignment) => {
    const equipment = equipmentById.get(assignment.equipment_id);
    return {
      equipmentCategory: equipment?.category ?? "",
      equipmentId: assignment.equipment_id,
      equipmentName: equipment?.name ?? "",
      id: assignment.id,
      notes: assignment.notes,
    };
  });
}

export async function listEventEquipmentAssignments(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const assignments = await database
    .from("event_equipment_assignments")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (assignments.error) throw assignments.error;
  if (!assignments.data.length) return [];

  const equipmentIds = assignments.data.map((item) => item.equipment_id);
  const equipment = await database
    .from("equipment_catalog")
    .select("id, name, category")
    .in("id", equipmentIds);

  if (equipment.error) throw equipment.error;

  return mapEventEquipmentAssignments(
    assignments.data,
    new Map(equipment.data.map((item) => [item.id, item])),
  );
}

export async function upsertEventEquipmentAssignment(
  database: SupabaseClient<Database>,
  eventId: string,
  values: EventEquipmentFormValues,
) {
  const result = await database
    .from("event_equipment_assignments")
    .upsert(
      {
        equipment_id: values.equipmentId,
        event_id: eventId,
        notes: values.notes.trim(),
      },
      { onConflict: "event_id,equipment_id" },
    )
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function deleteEventEquipmentAssignment(
  database: SupabaseClient<Database>,
  eventId: string,
  assignmentId: string,
) {
  const result = await database
    .from("event_equipment_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("id", assignmentId);

  if (result.error) throw result.error;
}
