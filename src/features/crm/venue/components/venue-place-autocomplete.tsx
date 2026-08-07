"use client";

import { useEffect, useState } from "react";

import type { VenueFormValues } from "../types/venue";

type Suggestion = {
  description: string;
  mainText: string;
  placeId: string;
  secondaryText: string;
};

type VenuePlaceAutocompleteProps = {
  setField: <TKey extends keyof VenueFormValues>(key: TKey, value: VenueFormValues[TKey]) => void;
  value: string;
};

export function VenuePlaceAutocomplete({ setField, value }: VenuePlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const input = value.trim();
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/integrations/google-places", {
        body: JSON.stringify({ action: "autocomplete", input }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      })
        .then((response) => response.ok ? response.json() as Promise<{ data: Suggestion[] }> : Promise.reject())
        .then((payload) => setSuggestions(payload.data))
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const selectPlace = async (placeId: string) => {
    setSuggestions([]);
    const response = await fetch("/api/integrations/google-places", {
      body: JSON.stringify({ action: "details", placeId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) return;

    const payload = await response.json() as { data: PlaceDetails };
    const place = payload.data;
    const components = new Map(
      (place.addressComponents ?? []).flatMap((component) =>
        (component.types ?? []).map((type) => [type, component.longText] as const),
      ),
    );
    setField("name", place.displayName?.text ?? value);
    setField("streetAddress", ([components.get("street_number"), components.get("route")].filter(Boolean).join(" ") || place.formattedAddress) ?? "");
    setField("city", components.get("locality") ?? components.get("postal_town") ?? "");
    setField("stateProvince", components.get("administrative_area_level_1") ?? "");
    setField("postalCode", components.get("postal_code") ?? "");
    setField("country", components.get("country") ?? "Mexico");
    setField("websiteUrl", place.websiteUri ?? "");
    setField("phone", place.nationalPhoneNumber ?? "");
    setField("googleMapsUrl", place.googleMapsUri ?? "");
  };

  return suggestions.length > 0 ? (
    <div className="relative z-20">
      <div className="absolute left-0 right-0 top-1 overflow-hidden rounded-md border border-zinc-700 bg-zinc-950 shadow-2xl">
        {suggestions.map((suggestion) => (
          <button
            className="block w-full border-b border-zinc-800 px-4 py-3 text-left last:border-0 hover:bg-zinc-800"
            key={suggestion.placeId}
            onClick={() => void selectPlace(suggestion.placeId)}
            type="button"
          >
            <span className="block text-sm font-bold text-zinc-100">{suggestion.mainText || suggestion.description}</span>
            {suggestion.secondaryText ? <span className="block text-xs text-zinc-500">{suggestion.secondaryText}</span> : null}
          </button>
        ))}
      </div>
    </div>
  ) : null;
}

type PlaceDetails = {
  addressComponents?: Array<{ longText?: string; types?: string[] }>;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
};
