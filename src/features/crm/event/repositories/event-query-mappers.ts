import type { Database } from "@/core/supabase/database.types";

import type { EventStaffAssignment, StaffPosition } from "../../staff/types/staff";
import type { ContactRole } from "../../shared/types/crm-options";
import type { EventContactSummary } from "../types/event";

export type ClientSummaryRow = Pick<
  Database["public"]["Tables"]["clients"]["Row"],
  "email" | "first_name" | "id" | "last_name" | "phone"
>;

type StaffRow = Pick<
  Database["public"]["Tables"]["staff_members"]["Row"],
  "display_name" | "id" | "name" | "phone"
>;

export const fullName = (client?: ClientSummaryRow) => {
  return client ? `${client.first_name} ${client.last_name}`.trim() : "";
};

export const mapContacts = (
  contacts: Database["public"]["Tables"]["event_contacts"]["Row"][],
  clients: Map<string, ClientSummaryRow>,
): EventContactSummary[] => {
  return contacts.flatMap((contact) => {
    const client = clients.get(contact.client_id);
    return client
      ? [{
          clientId: client.id,
          email: client.email,
          isPrimary: contact.is_primary,
          name: fullName(client),
          phone: client.phone,
          role: contact.role as ContactRole,
        }]
      : [];
  });
};

export const mapStaffAssignments = (
  assignments: Database["public"]["Tables"]["event_staff_assignments"]["Row"][],
  staffById: Map<string, StaffRow>,
): EventStaffAssignment[] => {
  return assignments.map((assignment) => {
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
};
