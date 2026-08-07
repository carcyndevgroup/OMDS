"use client";

import { useEffect, useState } from "react";

import type { Translate } from "../../shared/types/form-types";
import type { Venue } from "../types/venue";
import type { VenueDraft } from "../types/venue-draft";

type Suggestion = {
  description: string;
  mainText: string;
  placeId: string;
  secondaryText: string;
};

type VenuePickerProps = {
  name: string;
  onDraft: (draft: VenueDraft) => void;
  onExisting: (venue: Venue) => void;
  t: Translate;
  venues: Venue[];
};

export function VenuePicker({ name, onDraft, onExisting, t, venues }: VenuePickerProps) {
  const [query, setQuery] = useState(name);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [review, setReview] = useState<VenueDraft | null>(null);

  useEffect(() => {
    const input = query.trim().toLowerCase();
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/integrations/google-places", {
        body: JSON.stringify({ action: "autocomplete", input: query.trim() }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      })
        .then((response) => response.ok ? response.json() as Promise<{ data: Suggestion[] }> : Promise.reject())
        .then((payload) => setSuggestions(payload.data ?? []))
        .catch(() => { if (!controller.signal.aborted) setSuggestions([]); });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const storedMatches = venues.filter((venue) => venue.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5);

  const selectGooglePlace = async (placeId: string) => {
    setSuggestions([]);
    const response = await fetch("/api/integrations/google-places", {
      body: JSON.stringify({ action: "details", placeId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) return;
    const payload = await response.json() as { data: PlaceDetails };
    const place = payload.data;
    const components = new Map((place.addressComponents ?? []).flatMap((component) =>
      (component.types ?? []).map((type) => [type, component.longText] as const),
    ));
    const draft: VenueDraft = {
      city: components.get("locality") ?? components.get("postal_town") ?? "",
      country: components.get("country") ?? "Mexico",
      googleMapsUrl: place.googleMapsUri ?? "",
      name: place.displayName?.text ?? query,
      phone: place.nationalPhoneNumber ?? "",
      postalCode: components.get("postal_code") ?? "",
      stateProvince: components.get("administrative_area_level_1") ?? "",
      streetAddress: ([components.get("street_number"), components.get("route")].filter(Boolean).join(" ") || place.formattedAddress) ?? "",
      websiteUrl: place.websiteUri ?? "",
    };
    setQuery(draft.name);
    setReview(draft);
  };

  return (
    <div className="space-y-2">
      <input
        className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
        onChange={(event) => { setQuery(event.target.value); setReview(null); }}
        placeholder={t("crm.client.placeholder.selectVenue")}
        value={query}
      />
      {query.trim() && (storedMatches.length > 0 || suggestions.length > 0) ? (
        <div className="overflow-hidden rounded-md border border-zinc-700 bg-zinc-950">
          {storedMatches.map((venue) => (
            <button className="block w-full border-b border-zinc-800 px-3 py-2 text-left text-sm hover:bg-zinc-800" key={venue.id} onClick={() => { setQuery(venue.name); setSuggestions([]); onExisting(venue); }} type="button">{venue.name}</button>
          ))}
          {suggestions.map((suggestion) => (
            <button className="block w-full border-b border-zinc-800 px-3 py-2 text-left hover:bg-zinc-800" key={suggestion.placeId} onClick={() => void selectGooglePlace(suggestion.placeId)} type="button">
              <span className="block text-sm text-zinc-100">{suggestion.mainText || suggestion.description}</span>
              <span className="block text-xs text-zinc-500">{suggestion.secondaryText}</span>
            </button>
          ))}
          {suggestions.length > 0 ? (
            <div className="border-t border-zinc-800 px-3 py-2 text-right text-[11px] text-zinc-500">
              {t("crm.client.venue.poweredByGoogle")}
            </div>
          ) : null}
        </div>
      ) : null}
      {review ? (
        <div className="rounded-md border border-cyan-400/40 bg-cyan-400/10 p-3 text-sm">
          <p className="font-bold text-cyan-100">{t("crm.client.venue.reviewTitle")}</p>
          <p className="mt-1 text-zinc-300">{review.name}</p>
          <p className="text-xs text-zinc-400">{review.streetAddress}, {review.city}</p>
          <button className="mt-3 rounded-md bg-cyan-300 px-3 py-2 text-xs font-bold text-zinc-950" onClick={() => { onDraft(review); setReview(null); }} type="button">{t("crm.client.venue.reviewConfirm")}</button>
        </div>
      ) : null}
    </div>
  );
}

type PlaceDetails = {
  addressComponents?: Array<{ longText?: string; types?: string[] }>;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
};