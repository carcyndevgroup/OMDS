"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { useMemo, useState } from "react";

import type { Translate } from "../types/form-types";

type Country = { code: string; flag: string; name: string; dialCode: string };

const prioritizedCodes = new Set(["MX", "US", "CA"]);

const flagForCountry = (code: string) => String.fromCodePoint(
  ...code.split("").map((letter) => 127397 + letter.charCodeAt(0)),
);

const countryList = (locale: string): Country[] => {
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  return getCountries().map((code) => ({
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
    flag: flagForCountry(code),
    name: displayNames.of(code) ?? code,
  }));
};

type PhoneInputProps = {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  t: Translate;
  value: string;
};

export function PhoneInput({ error, label, onChange, t, value }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const countries = useMemo(() => countryList("en"), []);
  const selected = countries.find((country) => value.startsWith(country.dialCode));
  const digits = selected ? value.slice(selected.dialCode.length).replace(/\D/g, "") : value.replace(/\D/g, "");
  const filteredCountries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return countries
      .filter((country) => !term || `${country.name} ${country.dialCode}`.toLowerCase().includes(term))
      .sort((first, second) => Number(prioritizedCodes.has(second.code)) - Number(prioritizedCodes.has(first.code)));
  }, [search]);

  const selectCountry = (country: Country) => {
    onChange(`${country.dialCode}${digits}`);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-1">
      <label className="block text-sm font-semibold text-zinc-200">{label}</label>
      <div className="flex h-11 overflow-visible rounded-md border border-zinc-700 bg-zinc-950 focus-within:border-cyan-300">
        <button className="flex w-16 shrink-0 items-center justify-center gap-1 border-r border-zinc-700 text-lg" onClick={() => setIsOpen((open) => !open)} type="button">
          {selected?.flag ?? "🌐"}<ChevronDown aria-hidden="true" size={14} />
        </button>
        <span className="flex items-center px-2 text-sm text-zinc-400">{selected?.dialCode ?? ""}</span>
        <input aria-label={label} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-zinc-600" onChange={(event) => onChange(`${selected?.dialCode ?? ""}${event.target.value.replace(/\D/g, "")}`)} placeholder={t("crm.phone.placeholder.number")} type="tel" value={digits} />
      </div>
      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-64 overflow-hidden rounded-md border border-zinc-700 bg-zinc-950 shadow-2xl">
          <div className="flex items-center border-b border-zinc-800 px-3">
            <Search aria-hidden="true" className="text-zinc-500" size={17} />
            <input autoFocus className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none" onChange={(event) => setSearch(event.target.value)} placeholder={t("crm.phone.placeholder.country")} value={search} />
            {search ? <button aria-label={t("crm.phone.action.clearSearch")} className="p-1 text-zinc-400 hover:text-white" onClick={() => setSearch("")} type="button"><X aria-hidden="true" size={16} /></button> : null}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button className="flex w-full items-center gap-3 border-b border-zinc-800 px-3 py-3 text-left text-sm text-zinc-200 hover:bg-zinc-800" key={country.code} onClick={() => selectCountry(country)} type="button">
                <span className="text-lg">{country.flag}</span><span className="flex-1">{country.name}</span><span className="text-zinc-500">{country.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
