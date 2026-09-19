export interface CalendarEventInput {
  title: string;
  description: string;
  location: string;
  start: string; // ISO string with offset, e.g. 2026-10-10T18:00:00+05:00
  end: string;
}

function toUtcBasicDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function googleCalendarUrl(e: CalendarEventInput): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toUtcBasicDate(e.start)}/${toUtcBasicDate(e.end)}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}


function escapeIcs(text: string) {
  return text.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}

export function buildIcs(e: CalendarEventInput): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zain & Sonia Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@zain-sonia-wedding`,
    `DTSTAMP:${toUtcBasicDate(new Date().toISOString())}`,
    `DTSTART:${toUtcBasicDate(e.start)}`,
    `DTEND:${toUtcBasicDate(e.end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.description)}`,
    `LOCATION:${escapeIcs(e.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(e: CalendarEventInput, fileName: string) {
  const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
