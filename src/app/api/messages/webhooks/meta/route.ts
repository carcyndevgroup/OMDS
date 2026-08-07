import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const verificationToken = () => process.env.META_WEBHOOK_VERIFY_TOKEN;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && token === verificationToken() && challenge) {
    return new Response(challenge, { headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ code: "meta_webhook_verification_failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-hub-signature-256");
  const secret = process.env.META_APP_SECRET;
  if (!signature || !secret) return NextResponse.json({ code: "meta_signature_required" }, { status: 401 });

  const rawBody = await request.text();
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return NextResponse.json({ code: "meta_signature_invalid" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  // Provider-specific event normalization will persist entries after app credentials are configured.
  return NextResponse.json({ received: true });
}
