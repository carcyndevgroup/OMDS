import type { Json } from "./json.types";

export type ClientTable = {
  Row: {
    city: string;
    archived_at: string | null;
    company_name: string;
    country: string;
    created_at: string;
    email: string;
    facebook: string;
    first_name: string;
    id: string;
    instagram: string;
    last_name: string;
    lead_source: string;
    legal_first_name: string;
    legal_last_name: string;
    phone: string;
    postal_code: string;
    preferred_communication_method: string;
    state_province: string;
    street_address: string;
    updated_at: string;
  };
  Insert: {
    city?: string;
    archived_at?: string | null;
    company_name?: string;
    country?: string;
    created_at?: string;
    email: string;
    facebook?: string;
    first_name: string;
    id?: string;
    instagram?: string;
    last_name: string;
    lead_source: string;
    legal_first_name?: string;
    legal_last_name?: string;
    phone: string;
    postal_code?: string;
    preferred_communication_method?: string;
    state_province?: string;
    street_address?: string;
    updated_at?: string;
  };
  Update: Partial<ClientTable["Insert"]>;
  Relationships: [];
};

export type EventTable = {
  Row: {
    arrival_buffer_minutes: number;
    booking_status: string;
    booking_type: string;
    created_at: string;
    departure_buffer_minutes: number;
    event_date: string;
    event_hashtags: string;
    event_name: string;
    event_type: string;
    event_venue_contact_id: string | null;
    guest_count: number;
    id: string;
    assigned_event_venue_contact_id: string | null;
    client_operational_notes: string;
    internal_issue_notes: string;
    load_before_departure_minutes: number;
    marquee_sign_names: string;
    notes: string;
    operations_notes: string;
    pack_up_minutes: number;
    payment_partner_venue_id: string | null;
    power_supply_access: string;
    power_supply_notes: string;
    service_duration_minutes: number;
    service_end_time: string | null;
    service_location_description: string;
    service_start_time: string | null;
    special_requests: string;
    setup_duration_minutes: number;
    source_lead_id: string | null;
    unload_after_return_minutes: number;
    updated_at: string;
    venue_id: string | null;
    venue_name: string;
    venue_sub_location_id: string | null;
    venue_sub_location_other: string;
  };
  Insert: {
    arrival_buffer_minutes?: number;
    booking_status?: string;
    booking_type?: string;
    created_at?: string;
    departure_buffer_minutes?: number;
    event_date: string;
    event_hashtags?: string;
    event_name?: string;
    event_type: string;
    event_venue_contact_id?: string | null;
    guest_count: number;
    id?: string;
    assigned_event_venue_contact_id?: string | null;
    client_operational_notes?: string;
    internal_issue_notes?: string;
    load_before_departure_minutes?: number;
    marquee_sign_names?: string;
    notes?: string;
    operations_notes?: string;
    pack_up_minutes?: number;
    payment_partner_venue_id?: string | null;
    power_supply_access?: string;
    power_supply_notes?: string;
    service_duration_minutes?: number;
    service_end_time?: string | null;
    service_location_description?: string;
    service_start_time?: string | null;
    special_requests?: string;
    setup_duration_minutes?: number;
    source_lead_id?: string | null;
    unload_after_return_minutes?: number;
    updated_at?: string;
    venue_id?: string | null;
    venue_name?: string;
    venue_sub_location_id?: string | null;
    venue_sub_location_other?: string;
  };
  Update: Partial<EventTable["Insert"]>;
  Relationships: [];
};

export type EventContactTable = {
  Row: {
    client_id: string;
    event_id: string;
    is_primary: boolean;
    role: string;
  };
  Insert: {
    client_id: string;
    event_id: string;
    is_primary?: boolean;
    role: string;
  };
  Update: Partial<EventContactTable["Insert"]>;
  Relationships: [];
};

export type EventServiceTable = {
  Row: { event_id: string; service_id: string };
  Insert: { event_id: string; service_id: string };
  Update: Partial<EventServiceTable["Insert"]>;
  Relationships: [];
};

export type ClientFunctions = {
  record_crm_activity: {
    Args: {
      target_entity: string;
      target_event_type: string;
      target_linked_path?: string | null;
      target_record_id: string;
      target_summary: string;
    };
    Returns: string;
  };
  set_crm_archive_state: {
    Args: { target_archived: boolean; target_entity: string; target_record_id: string };
    Returns: string | null;
  };
  create_payroll_payment_batch: {
    Args: {
      input_line_item_ids: string[];
      input_notes?: string;
      input_scheduled_pay_date: string;
    };
    Returns: string;
  };
  record_payroll_payment: {
    Args: {
      input_line_item_ids: string[];
      input_payment: Json;
    };
    Returns: string;
  };
  create_client_event: {
    Args: { input: Json; source_lead_id?: string | null };
    Returns: { client_id: string; event_id: string }[];
  };
  update_client_event: {
    Args: {
      input: Json;
      target_client_id: string;
      target_event_id: string;
    };
    Returns: undefined;
  };
};
