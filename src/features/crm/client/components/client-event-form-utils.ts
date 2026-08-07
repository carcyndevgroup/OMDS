export const customVenueValue = "custom";
export const customSubLocationValue = "custom";

export const addHoursToTime = (value: string, hoursToAdd: number) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";

  const nextHours = (hours + hoursToAdd) % 24;
  return `${String(nextHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
