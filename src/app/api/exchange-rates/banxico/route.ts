import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const BANXICO_FIX_SERIES = "SF43718";
const BANXICO_URL =
  `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${BANXICO_FIX_SERIES}/datos/oportuno`;

type BanxicoResponse = {
  bmx?: {
    series?: Array<{
      datos?: Array<{
        dato?: string;
        fecha?: string;
      }>;
    }>;
  };
};

export async function GET() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const token = process.env.BANXICO_SIE_TOKEN;
  if (!token) {
    return NextResponse.json({ code: "banxico_token_missing" }, { status: 503 });
  }

  const response = await fetch(BANXICO_URL, {
    cache: "no-store",
    headers: { "Bmx-Token": token },
  });

  if (!response.ok) {
    return NextResponse.json({ code: "banxico_fetch_failed" }, { status: 502 });
  }

  const payload = (await response.json()) as BanxicoResponse;
  const latest = payload.bmx?.series?.[0]?.datos?.[0];
  const rate = Number(latest?.dato?.replaceAll(",", ""));

  if (!Number.isFinite(rate) || rate <= 0) {
    return NextResponse.json({ code: "banxico_rate_unavailable" }, { status: 502 });
  }

  return NextResponse.json({
    data: {
      date: latest?.fecha ?? "",
      rate: rate.toFixed(6),
      seriesId: BANXICO_FIX_SERIES,
      source: `Banxico FIX ${BANXICO_FIX_SERIES}`,
    },
  });
}
