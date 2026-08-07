import { NextResponse } from "next/server";

import { getEmailAdapter } from "@/core/messages/email-adapter-factory";
import { createServerSupabaseClient } from "@/core/supabase/server-client";

const providers = ["email", "instagram", "facebook", "tiktok"] as const;

export async function GET() {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const result = await database
    .from("message_connections")
    .select("id, provider, display_name, address, status, updated_at")
    .in("provider", providers)
    .order("provider");
  if (result.error) {
    return NextResponse.json({ code: "message_connections_load_failed" }, { status: 500 });
  }

  const emailStatus = getEmailAdapter().status.configured ? "connected" : "not_connected";
  const connections = providers.map((provider) => {
    const connection = result.data.find((item) => item.provider === provider);
    return connection ?? {
      id: null,
      provider,
      display_name: provider,
      address: null,
      status: provider === "email" ? emailStatus : "not_connected",
      updated_at: null,
    };
  });

  return NextResponse.json({ data: connections });
}