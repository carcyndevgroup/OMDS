import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const BUCKET = "message-attachments";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: Context) {
  const params = await props.params;
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const attachment = await database
    .from("message_attachments")
    .select("storage_path, file_name")
    .eq("id", params.id)
    .maybeSingle();
  if (attachment.error) return NextResponse.json({ code: "attachment_load_failed" }, { status: 500 });
  if (!attachment.data) return NextResponse.json({ code: "attachment_not_found" }, { status: 404 });

  const signed = await database.storage.from(BUCKET).createSignedUrl(attachment.data.storage_path, 60 * 15);
  if (signed.error) return NextResponse.json({ code: "attachment_url_failed" }, { status: 500 });
  return NextResponse.redirect(signed.data.signedUrl);
}
