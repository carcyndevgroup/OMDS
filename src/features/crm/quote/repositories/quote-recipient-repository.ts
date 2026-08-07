import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import type { QuoteRecipientValues } from "../types/quote";

export async function updateQuoteRecipients(
  database: SupabaseClient<Database>,
  quoteId: string,
  values: QuoteRecipientValues[],
) {
  await ensureDraftQuote(database, quoteId);

  const unique = uniqueRecipients(values);
  const remove = await database
    .from("quote_recipients")
    .delete()
    .eq("quote_id", quoteId);
  if (remove.error) throw remove.error;

  if (!unique.length) return;

  const insert = await database.from("quote_recipients").insert(
    unique.map((recipient) => ({
      client_id: recipient.clientId,
      email: recipient.email.trim(),
      name: recipient.name.trim(),
      quote_id: quoteId,
    })),
  );
  if (insert.error) throw insert.error;
}

async function ensureDraftQuote(
  database: SupabaseClient<Database>,
  quoteId: string,
) {
  const quote = await database
    .from("quotes")
    .select("status")
    .eq("id", quoteId)
    .single();

  if (quote.error) throw quote.error;
  if (quote.data.status !== "draft") throw new Error("quote_locked");
}

function uniqueRecipients(values: QuoteRecipientValues[]) {
  const byEmail = new Map<string, QuoteRecipientValues>();

  values.forEach((recipient) => {
    const email = recipient.email.trim().toLowerCase();
    if (!email || !recipient.name.trim()) return;
    byEmail.set(email, { ...recipient, email });
  });

  return Array.from(byEmail.values());
}
