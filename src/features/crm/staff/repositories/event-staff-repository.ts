import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  EventStaffAssignment,
  EventStaffFormValues,
  StaffPosition,
} from "../types/staff";

type AssignmentRow =
  Database["public"]["Tables"]["event_staff_assignments"]["Row"];

export async function listEventStaffAssignments(
  database: SupabaseClient<Database>,
  eventId: string,
): Promise<EventStaffAssignment[]> {
  const assignments = await database
    .from("event_staff_assignments")
    .select("*")
    .eq("event_id", eventId)
    .order("position");

  if (assignments.error) throw assignments.error;
  if (!assignments.data.length) return [];

  const staffIds = assignments.data.map((assignment) => assignment.staff_member_id);
  const staff = await database
    .from("staff_members")
    .select("id, display_name, name, phone")
    .in("id", staffIds);

  if (staff.error) throw staff.error;

  const staffById = new Map(staff.data.map((member) => [member.id, member]));

  return assignments.data.map((assignment: AssignmentRow) => {
    const member = staffById.get(assignment.staff_member_id);
    return {
      id: assignment.id,
      notes: assignment.notes,
      position: assignment.position as StaffPosition,
      staffMemberId: assignment.staff_member_id,
      staffName: member?.display_name || member?.name || "",
      staffPhone: member?.phone ?? "",
    };
  });
}

export async function upsertEventStaffAssignment(
  database: SupabaseClient<Database>,
  eventId: string,
  values: EventStaffFormValues,
) {
  const result = await database
    .from("event_staff_assignments")
    .upsert(
      {
        event_id: eventId,
        notes: values.notes.trim(),
        position: values.position,
        staff_member_id: values.staffMemberId,
      },
      { onConflict: "event_id,position" },
    )
    .select("id")
    .single();

  if (result.error) throw result.error;
  return result.data.id;
}

export async function deleteEventStaffAssignment(
  database: SupabaseClient<Database>,
  eventId: string,
  assignmentId: string,
) {
  const result = await database
    .from("event_staff_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("id", assignmentId);

  if (result.error) throw result.error;
}
