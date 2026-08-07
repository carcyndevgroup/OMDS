const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatLocal = (digits: string, countryCode: string) => {
  return `+${countryCode} (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export function formatPhone(value: string) {
  const digits = digitsOnly(value);

  if (digits.length === 10) return formatLocal(digits, "52");
  if (digits.length === 12 && digits.startsWith("52")) {
    return formatLocal(digits.slice(2), "52");
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return formatLocal(digits.slice(1), "1");
  }

  return value.trim();
}

export function phoneHref(value: string) {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits}` : "";
}
