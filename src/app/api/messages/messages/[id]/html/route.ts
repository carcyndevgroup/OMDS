import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const maxHtmlBytes = 1024 * 1024;
type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: Context) {
  const params = await props.params;
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const message = await database.from("messages").select("body_html").eq("id", params.id).maybeSingle();
  if (message.error) return NextResponse.json({ code: "message_html_load_failed" }, { status: 500 });
  if (!message.data) return NextResponse.json({ code: "message_not_found" }, { status: 404 });
  if (!message.data.body_html) return NextResponse.json({ data: { bodyHtml: null } });
  if (Buffer.byteLength(message.data.body_html, "utf8") > maxHtmlBytes) return NextResponse.json({ code: "message_html_too_large" }, { status: 413 });

  const bodyHtml = DOMPurify.sanitize(message.data.body_html, {
    FORBID_ATTR: ["src", "href", "style"],
    FORBID_TAGS: ["base", "form", "iframe", "link", "object", "script", "style"],
  });
  return NextResponse.json({ data: { bodyHtml } });
}
