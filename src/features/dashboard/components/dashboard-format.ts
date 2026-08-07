export function formatDashboardDate(value: string, locale: string) {
  if (!value) return "";
  const date = parseDateOnly(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDashboardTime(value: string, locale: string) {
  if (!value) return "";
  const [hours = "0", minutes = "0"] = value.split(":");
  const hourNumber = Number(hours);
  const minuteNumber = Number(minutes);
  if (
    !Number.isInteger(hourNumber) ||
    !Number.isInteger(minuteNumber) ||
    hourNumber < 0 ||
    hourNumber > 23 ||
    minuteNumber < 0 ||
    minuteNumber > 59
  ) {
    return "";
  }

  const date = new Date();
  date.setHours(hourNumber, minuteNumber, 0, 0);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(Number.NaN);
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
