import type { LeadInsert, LeadRow } from "@/core/supabase/database.types";

import type {
  EventType,
  Lead,
  LeadRole,
  LeadSource,
  LeadStatus,
} from "../types/lead";

export function toLeadInsert(lead: Lead): LeadInsert {
  return {
    created_at: lead.createdAt,
    email: lead.email,
    event_date: lead.eventDate,
    event_type: lead.eventType,
    guest_count: Number(lead.guestCount),
    id: lead.id,
    lead_source: lead.leadSource,
    name: lead.name,
    notes: lead.notes,
    phone: lead.phone,
    role: lead.role,
    status: lead.status,
    updated_at: lead.updatedAt,
    venue_id: lead.venueId || null,
    venue_name: lead.venueName,
  };
}

export function toLead(row: LeadRow, serviceIds: string[]): Lead {
  return {
    createdAt: row.created_at,
    archivedAt: row.archived_at,
    email: row.email,
    eventDate: row.event_date,
    eventType: row.event_type as EventType,
    guestCount: String(row.guest_count),
    id: row.id,
    leadSource: row.lead_source as LeadSource,
    name: row.name,
    notes: row.notes,
    phone: row.phone,
    role: row.role as LeadRole,
    serviceIds,
    status: row.status as LeadStatus,
    updatedAt: row.updated_at,
    venueId: row.venue_id ?? "",
    venueDraft: null,
    venueName: row.venue_name,
  };
}
