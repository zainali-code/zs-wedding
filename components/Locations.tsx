"use client";

import { googleCalendarUrl } from "@/lib/calendar";
import { WEDDING_EVENTS } from "@/lib/events";

function directionsHref(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function Locations() {
  return (
    <section id="locations" className="section-ivory relative py-28 px-6">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <p className="eyebrow text-[var(--maroon-800)]">Find Your Way</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3 text-[var(--maroon-950)]">Locations</h2>
        <div className="divider-line my-6" />
        <p className="text-[var(--maroon-900)]/70 max-w-xl mx-auto">
          Open directions, or save the date straight to your calendar.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {WEDDING_EVENTS.map((v) => {
          const calEvent = {
            title: v.label,
            description: `Join us for the ${v.label} at ${v.venueShort}.`,
            location: v.venue,
            start: v.start,
            end: v.end,
          };
          return (
            <div key={v.id} className="bg-[var(--cream)] border border-[var(--gold-500)]/25 rounded-sm overflow-hidden">
              <div className="p-6 text-left">
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[var(--gold-500)]">{v.dateLabel}</p>
                <h3 className="font-display text-2xl text-[var(--maroon-950)] mt-1">{v.label}</h3>
                <p className="text-sm text-[var(--maroon-900)]/60 mt-1">{v.venueShort}</p>

                <div className="flex flex-col gap-2 mt-5">
                  <a
                    href={directionsHref(v.lat, v.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-royal-dark btn-royal w-full justify-center text-xs"
                  >
                    Get Directions
                  </a>
                  <a
                    href={googleCalendarUrl(calEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center text-[0.65rem] tracking-wide uppercase border border-[var(--maroon-800)]/30 text-[var(--maroon-900)] py-2 rounded-sm hover:bg-[var(--maroon-800)]/5"
                  >
                    Add to Google Calendar
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
