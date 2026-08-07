import { NextResponse } from "next/server";

const getApiKey = () => process.env.GOOGLE_MAPS_API_KEY?.trim();

type RequestBody = {
  action?: "autocomplete" | "details" | "distance";
  input?: string;
  origin?: string;
  placeId?: string;
  destination?: string;
};

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) return NextResponse.json({ code: "google_maps_not_configured" }, { status: 503 });

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  try {
    if (body.action === "autocomplete" && body.input?.trim()) {
      const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        body: JSON.stringify({ input: body.input.trim(), includedRegionCodes: ["mx"] }),
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
        method: "POST",
      });
      if (!response.ok) return NextResponse.json({ code: "google_autocomplete_failed" }, { status: 502 });
      const data = await response.json() as { suggestions?: Array<{ placePrediction?: { placeId?: string; text?: { text?: string }; structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } } } }> };
      return NextResponse.json({ data: (data.suggestions ?? []).flatMap((suggestion) => {
        const prediction = suggestion.placePrediction;
        return prediction?.placeId ? [{ placeId: prediction.placeId, description: prediction.text?.text ?? "", mainText: prediction.structuredFormat?.mainText?.text ?? "", secondaryText: prediction.structuredFormat?.secondaryText?.text ?? "" }] : [];
      }) });
    }

    if (body.action === "details" && body.placeId) {
      const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(body.placeId)}`, {
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "id,displayName,formattedAddress,websiteUri,nationalPhoneNumber,googleMapsUri,addressComponents" },
      });
      if (!response.ok) return NextResponse.json({ code: "google_place_details_failed" }, { status: 502 });
      return NextResponse.json({ data: await response.json() });
    }

    if (body.action === "distance" && body.origin?.trim() && body.destination?.trim()) {
      const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
      url.searchParams.set("origins", body.origin.trim());
      url.searchParams.set("destinations", body.destination.trim());
      url.searchParams.set("mode", "driving");
      url.searchParams.set("units", "metric");
      url.searchParams.set("key", apiKey);
      const response = await fetch(url);
      if (!response.ok) return NextResponse.json({ code: "google_distance_failed" }, { status: 502 });
      const data = await response.json() as {
        rows?: Array<{
          elements?: Array<{
            distance?: { value?: number };
            duration?: { value?: number };
            status?: string;
          }>;
        }>;
      };
      const element = data.rows?.[0]?.elements?.[0];
      if (!element || element.status !== "OK" || !element.distance?.value || !element.duration?.value) {
        return NextResponse.json({ code: "google_distance_unavailable" }, { status: 502 });
      }

      return NextResponse.json({
        data: {
          distanceKm: Number((element.distance.value / 1000).toFixed(1)),
          distanceMeters: element.distance.value,
          durationMinutes: Math.ceil(element.duration.value / 60),
          durationSeconds: element.duration.value,
        },
      });
    }
  } catch {
    return NextResponse.json({ code: "google_maps_request_failed" }, { status: 502 });
  }

  return NextResponse.json({ code: "invalid_google_maps_request" }, { status: 400 });
}
