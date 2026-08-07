export function getCalendarStatusClasses(bookingStatus: string) {
  return bookingStatus === "confirmed"
    ? {
        badge: "bg-cyan-300/15 text-cyan-200",
        day: "border-cyan-300/50 bg-cyan-300/20 text-cyan-100",
        dot: "bg-cyan-200",
        title: "text-cyan-200",
      }
    : {
        badge: "bg-amber-300/15 text-amber-200",
        day: "border-amber-300/50 bg-amber-300/20 text-amber-100",
        dot: "bg-amber-200",
        title: "text-amber-200",
      };
}
