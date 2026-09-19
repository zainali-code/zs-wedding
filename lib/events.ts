export const WEDDING_EVENTS = [
  {
    id: "mehndi",
    label: "Rang e Mehndi Festival",
    dateLabel: "10 October 2026",
    timeLabel: "6:00 PM onwards",
    venue: "Aangan, Karachi",
    venueShort: "Aangan",
    note: "An evening of colour, music and mehndi.",
    start: "2026-10-10T18:00:00+05:00",
    end: "2026-10-10T23:00:00+05:00",
    lat: 24.911694,
    lng: 67.0938758,
  },
  {
    id: "baraat",
    label: "Baraat",
    dateLabel: "16 October 2026",
    timeLabel: "7:30 PM onwards",
    venue: "Hilltop (Platinum)",
    venueShort: "Hilltop (Platinum)",
    note: "The wedding ceremony and reception.",
    start: "2026-10-16T19:30:00+05:00",
    end: "2026-10-17T00:30:00+05:00",
    lat: 24.9080814,
    lng: 67.119012,
  },
  {
    id: "valima",
    label: "Valima",
    dateLabel: "18 October 2026",
    timeLabel: "8:00 PM onwards",
    venue: "The Royal Court, Karachi",
    venueShort: "The Royal Court",
    note: "A celebratory dinner to close the festivities.",
    start: "2026-10-18T20:00:00+05:00",
    end: "2026-10-19T00:00:00+05:00",
    lat: 24.9289141,
    lng: 67.113197,
  },
] as const;


export function getActiveCountdownEvent(now = Date.now()) {
  const upcoming = WEDDING_EVENTS.find((e) => new Date(e.start).getTime() > now);
  return upcoming ?? null;
}
