export function getCancunDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Cancun",
    year: "numeric",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => {
    return parts.find((item) => item.type === type)?.value ?? "";
  };

  return `${part("year")}-${part("month")}-${part("day")}`;
}
