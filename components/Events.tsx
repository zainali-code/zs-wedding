import { googleCalendarUrl } from "@/lib/calendar";
import { WEDDING_EVENTS } from "@/lib/events";

function directionsHref(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

const EVENT_ICONS = [
  { src: "/celebration/mehndi.png", alt: "Rang e Mehndi Festival ceremonial pots and peacock feathers" },
  { src: "/celebration/baraat.png", alt: "Baraat horse-drawn carriage" },
  { src: "/celebration/valima.png", alt: "Valima calligraphy" },
] as const;

export default function Events() {
  return (
    <section id="celebration" className="section-ivory relative py-24 px-5">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="eyebrow text-[var(--maroon-800)]">Three Celebrations</p>
        <h2 className="font-display text-4xl md:text-6xl mt-3 text-[var(--maroon-950)]">
          The Celebration
        </h2>
        <div className="divider-line my-6" />
        <p className="text-[var(--maroon-900)]/70 max-w-xl mx-auto text-sm md:text-base">
          Three evenings, one story — join us as we celebrate the beginning of our forever.
        </p>
      </div>

      <div className="celebration-events">
        {WEDDING_EVENTS.map((event, index) => {
          const icon = EVENT_ICONS[index];
          const calendarEvent = {
            title: event.label,
            description: `${event.note} Zain & Sonia's wedding celebration.`,
            location: event.venue,
            start: event.start,
            end: event.end,
          };

          return (
            <article key={event.id} className="celebration-event">
              <div className="celebration-event-icon">
                <img src={icon.src} alt={icon.alt} />
              </div>

              <p className="celebration-event-date">{event.dateLabel}</p>
              <h3 className="celebration-event-name">{event.label}</h3>
              <p className="celebration-event-time">{event.timeLabel}</p>
              <p className="celebration-event-venue">{event.venue}</p>
              <p className="celebration-event-note">&ldquo;{event.note}&rdquo;</p>

              <div className="celebration-event-actions">
                <a
                  href={directionsHref(event.lat, event.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="celebration-event-link"
                >
                  Get Directions
                </a>
                <a
                  href={googleCalendarUrl(calendarEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="celebration-event-link celebration-event-calendar"
                >
                  Add to Google Calendar
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
