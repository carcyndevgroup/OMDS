import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

type CleanupBody = {
  clientIds?: string[];
  leadIds?: string[];
  confirmation?: string;
  purgeAll?: boolean;
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ code: "cleanup_disabled_in_production" }, { status: 403 });
  }

  let body: CleanupBody;
  try {
    body = await request.json() as CleanupBody;
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  if (body.confirmation !== (body.purgeAll ? "PURGE ALL DATA" : "PURGE SELECTED")) {
    return NextResponse.json({ code: "confirmation_required" }, { status: 400 });
  }

  const client = await createServerSupabaseClient();
  const [clientsResult, leadsResult] = body.purgeAll
    ? await Promise.all([
        client.from("clients").select("id"),
        client.from("leads").select("id"),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  if (clientsResult.error || leadsResult.error) {
    return NextResponse.json({ code: "cleanup_load_failed" }, { status: 500 });
  }

  const clientIds = body.purgeAll ? clientsResult.data.map((row) => row.id) : body.clientIds ?? [];
  const leadIds = body.purgeAll ? leadsResult.data.map((row) => row.id) : body.leadIds ?? [];
  if (clientIds.length === 0 && leadIds.length === 0) {
    return NextResponse.json({ code: "nothing_selected" }, { status: 400 });
  }

  const [clientsPurge, leadsPurge] = await Promise.all([
    clientIds.length ? client.rpc("purge_crm_clients", { target_client_ids: clientIds }) : Promise.resolve({ data: null, error: null }),
    leadIds.length ? client.rpc("purge_crm_leads", { target_lead_ids: leadIds }) : Promise.resolve({ data: null, error: null }),
  ]);
  if (clientsPurge.error || leadsPurge.error) {
    console.error("crm_cleanup_failed", clientsPurge.error ?? leadsPurge.error);
    return NextResponse.json({ code: "cleanup_failed" }, { status: 500 });
  }

  return NextResponse.json({ data: { clients: clientsPurge.data, leads: leadsPurge.data } });
}