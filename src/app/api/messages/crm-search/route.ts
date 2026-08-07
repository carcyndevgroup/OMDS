import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const types = new Set(["clients", "events", "leads", "staff"]);

export async function GET(request: Request) {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const type = params.get("type") ?? "";
  const query = params.get("q")?.trim() ?? "";
  if (!types.has(type) || query.length < 2) return NextResponse.json({ data: [] });
  const pattern = `%${query}%`;

  if (type === "leads") {
    const result = await database.from("leads").select("id,name,email").or(`name.ilike.${pattern},email.ilike.${pattern}`).limit(8);
    if (result.error) return NextResponse.json({ code: "crm_search_failed" }, { status: 500 });
    return NextResponse.json({ data: result.data.map((row) => ({ id: row.id, label: `${row.name} (${row.email})` })) });
  }
  if (type === "clients") {
    const result = await database.from("clients").select("id,first_name,last_name,email").or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern}`).limit(8);
    if (result.error) return NextResponse.json({ code: "crm_search_failed" }, { status: 500 });
    return NextResponse.json({ data: result.data.map((row) => ({ id: row.id, label: `${row.first_name} ${row.last_name} (${row.email})` })) });
  }
  if (type === "staff") {
    const result = await database.from("app_users").select("id,role").limit(50);
    if (result.error) return NextResponse.json({ code: "crm_search_failed" }, { status: 500 });
    const normalized = query.toLowerCase();
    return NextResponse.json({ data: result.data.filter((row) => row.id.toLowerCase().includes(normalized) || row.role.includes(normalized)).slice(0, 8).map((row) => ({ id: row.id, label: `${row.role} (${row.id})` })) });
  }
  const result = await database.from("events").select("id,event_name,event_date").ilike("event_name", pattern).limit(8);
  if (result.error) return NextResponse.json({ code: "crm_search_failed" }, { status: 500 });
  return NextResponse.json({ data: result.data.map((row) => ({ id: row.id, label: `${row.event_name} (${row.event_date})` })) });
}
