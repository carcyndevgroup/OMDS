import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { QuoteUpdateVersionValues } from "../types/quote";
import { calculateQuoteTotals } from "./quote-calculations";

export async function updateQuoteVersionSettings(
  database: SupabaseClient<Database>,
  versionId: string,
  values: QuoteUpdateVersionValues,
) {
  await ensureDraftVersion(database, versionId);

  const update = await database
    .from("quote_versions")
    .update({
      apply_exchange_rate_margin: values.applyExchangeRateMargin,
      applies_isr_retention: values.appliesIsrRetention,
      applies_iva_retention: values.appliesIvaRetention,
      applies_iva_tax: values.appliesIvaTax,
      discount_type: values.discountType,
      discount_value_mxn: Number(values.discountValueMxn),
      display_currency: values.displayCurrency,
      exchange_rate_margin_percent: Number(values.exchangeRateMarginPercent),
      exchange_rate_to_mxn: Number(values.exchangeRateToMxn),
      expires_at: values.expiresAt ? `${values.expiresAt}T23:59:59-05:00` : null,
      isr_retention_rate_percent: Number(values.isrRetentionRatePercent),
      iva_retention_rate_percent: Number(values.ivaRetentionRatePercent),
      payment_plan_id: values.paymentPlanId,
      tax_rate_percent: Number(values.taxRatePercent),
      ...(values.contractTemplateKey
        ? { contract_template_key: values.contractTemplateKey }
        : {}),
      ...(values.questionnaireTemplateKey
        ? { questionnaire_template_key: values.questionnaireTemplateKey }
        : {}),
    })
    .eq("id", versionId);
  if (update.error) throw update.error;

  await recalculateQuoteVersion(database, versionId);
}

async function ensureDraftVersion(
  database: SupabaseClient<Database>,
  versionId: string,
) {
  const version = await database
    .from("quote_versions")
    .select("status")
    .eq("id", versionId)
    .single();

  if (version.error) throw version.error;
  if (version.data.status !== "draft") throw new Error("quote_version_locked");
}

async function recalculateQuoteVersion(
  database: SupabaseClient<Database>,
  versionId: string,
) {
  const [version, items] = await Promise.all([
    database.from("quote_versions").select("*").eq("id", versionId).single(),
    database.from("quote_items").select("*").eq("quote_version_id", versionId),
  ]);
  if (version.error) throw version.error;
  if (items.error) throw items.error;

  const totals = calculateQuoteTotals(version.data, items.data);
  const update = await database
    .from("quote_versions")
    .update(totals)
    .eq("id", versionId);
  if (update.error) throw update.error;
}
