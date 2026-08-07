import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type {
  Venue,
  VenueFormValues,
  VenueSettingsFormValues,
} from "../types/venue";
import type { VenueRepository } from "./venue-repository";

type VenueRow = Database["public"]["Tables"]["venues"]["Row"];

const toVenue = (row: VenueRow): Venue => ({
  area: row.area,
  brochureBehavior: row.brochure_behavior,
  city: row.city,
  commissionFixedAmount: row.commission_fixed_amount,
  commissionModel: row.commission_model,
  commissionNotes: row.commission_notes,
  commissionPercentage: row.commission_percentage,
  country: row.country,
  createdAt: row.created_at,
  distanceFromHqKm: row.distance_from_hq_km,
  facebook: row.facebook,
  fiscalDefaultBankAccountId: row.fiscal_default_bank_account_id ?? "",
  fiscalDefaultProfileId: row.fiscal_default_profile_id ?? "",
  googleMapsUrl: row.google_maps_url,
  id: row.id,
  instagram: row.instagram,
  internalStatus: row.internal_status === "inactive" ? "inactive" : "active",
  isPreferredVendor: row.is_preferred_vendor,
  name: row.name,
  notes: row.notes,
  facturaRecipient: row.factura_recipient,
  invoiceBehavior: row.invoice_behavior,
  paymentBillingType: row.payment_billing_type,
  paymentResponsibility: row.payment_responsibility,
  phone: row.phone,
  postalCode: row.postal_code,
  quotePricingModel: row.quote_pricing_model,
  requiresSatFiscal: row.requires_sat_fiscal,
  settingsNotes: row.settings_notes,
  stateProvince: row.state_province,
  streetAddress: row.street_address,
  suppressClientInvoice: row.suppress_client_invoice,
  travelTimeMinutes: row.travel_time_minutes,
  updatedAt: row.updated_at,
  usesSubLocations: row.uses_sub_locations,
  websiteUrl: row.website_url,
});

const toNumberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toVenuePayload = (values: VenueFormValues) => ({
  area: values.area,
  city: values.city.trim(),
  commission_notes: values.commissionNotes.trim(),
  country: values.country.trim(),
  distance_from_hq_km: toNumberOrNull(values.distanceFromHqKm),
  facebook: values.facebook.trim(),
  google_maps_url: values.googleMapsUrl.trim(),
  instagram: values.instagram.trim(),
  internal_status: values.internalStatus,
  is_preferred_vendor: values.isPreferredVendor,
  name: values.name.trim(),
  notes: values.notes.trim(),
  payment_billing_type: values.paymentBillingType.trim(),
  phone: values.phone.trim(),
  postal_code: values.postalCode.trim(),
  requires_sat_fiscal: values.requiresSatFiscal,
  state_province: values.stateProvince.trim(),
  street_address: values.streetAddress.trim(),
  travel_time_minutes: toNumberOrNull(values.travelTimeMinutes),
  uses_sub_locations: values.usesSubLocations,
  website_url: values.websiteUrl.trim(),
});

const defaultSettingsPayload = (isPreferredVendor: boolean) => {
  return isPreferredVendor
    ? {
        brochure_behavior: "pv_brochure",
        commission_model: "fixed_percentage",
        factura_recipient: "venue_hotel",
        invoice_behavior: "venue_fiscal_factura",
        payment_responsibility: "venue_hotel",
        quote_pricing_model: "pv_commission",
        suppress_client_invoice: true,
      }
    : {
        brochure_behavior: "direct_brochure",
        commission_model: "none",
        factura_recipient: "client",
        invoice_behavior: "omds_client_invoice",
        payment_responsibility: "client",
        quote_pricing_model: "direct",
        suppress_client_invoice: false,
      };
};

const toSettingsPayload = (values: VenueSettingsFormValues) => ({
  brochure_behavior: values.brochureBehavior,
  commission_fixed_amount: toNumberOrNull(values.commissionFixedAmount),
  commission_model: values.commissionModel,
  commission_percentage: toNumberOrNull(values.commissionPercentage),
  factura_recipient: values.facturaRecipient,
  fiscal_default_bank_account_id: values.fiscalDefaultBankAccountId || null,
  fiscal_default_profile_id: values.fiscalDefaultProfileId || null,
  invoice_behavior: values.invoiceBehavior,
  payment_responsibility: values.paymentResponsibility,
  quote_pricing_model: values.quotePricingModel,
  settings_notes: values.settingsNotes.trim(),
  suppress_client_invoice: values.suppressClientInvoice,
});

export function createSupabaseVenueRepository(
  client: SupabaseClient<Database>,
): VenueRepository {
  return {
    async create(values) {
      const result = await client
        .from("venues")
        .insert({
          ...toVenuePayload(values),
          ...defaultSettingsPayload(values.isPreferredVendor),
        })
        .select("*")
        .single();

      if (result.error) throw result.error;
      return toVenue(result.data);
    },
    async findById(id) {
      const result = await client
        .from("venues")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (result.error) throw result.error;
      return result.data ? toVenue(result.data) : null;
    },
    async list() {
      const result = await client.from("venues").select("*").order("name");
      if (result.error) throw result.error;
      return result.data.map(toVenue);
    },
    async update(id, values) {
      const result = await client
        .from("venues")
        .update(toVenuePayload(values))
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (result.error) throw result.error;
      return result.data ? toVenue(result.data) : null;
    },
    async updateSettings(id, values) {
      const result = await client
        .from("venues")
        .update(toSettingsPayload(values))
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (result.error) throw result.error;
      return result.data ? toVenue(result.data) : null;
    },
  };
}
