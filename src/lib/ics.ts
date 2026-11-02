import type { EventItem } from "@/data/events";

/** Builds a downloadable calendar file so an event can be added to any calendar app. */
export function icsHref(e: EventItem) {
  const day = e.date.replaceAll("-", "");
  const next = new Date(new Date(`${e.date}T12:00:00`).getTime() + 86400000)
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EMFC//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@emfc.es`,
    `DTSTAMP:${day}T000000Z`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${esc("EMFC: " + e.title)}`,
    `LOCATION:${esc(e.location)}`,
    `DESCRIPTION:${esc(e.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
