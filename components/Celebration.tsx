import { WEDDING_EVENTS } from "@/lib/events";

export default function Celebration() {
  return (
    <section id="celebration" className="section-celebration relative py-32 px-6">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <p className="eyebrow text-[var(--maroon-800)]">Three Celebrations</p>
        <h2 className="font-display text-4xl md:text-6xl mt-3 text-[var(--maroon-950)]">Venue &amp; Direction</h2>
        <div className="divider-line my-6" />
        <p className="text-[var(--maroon-900)]/70 max-w-xl mx-auto">
          Three evenings, one story — join us as we celebrate the beginning of our forever.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {WEDDING_EVENTS.map((e, i) => (
          <article
            key={e.id}
            className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center bg-white/60 border border-[var(--gold-500)]/20 rounded-sm px-8 py-10 md:px-12 md:py-12"
          >
            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2">
              <span className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--gold-500)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display italic text-6xl md:text-7xl text-[var(--gold-300)]/50 leading-none select-none">
                {e.label[0]}
              </span>
            </div>

            <div className="text-left">
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--gold-500)] mb-1">
                {e.dateLabel} &nbsp;·&nbsp; {e.timeLabel}
              </p>
              <h3 className="font-display text-4xl md:text-5xl text-[var(--maroon-950)] leading-tight">{e.label}</h3>
              <p className="text-sm text-[var(--maroon-900)]/50 mt-2 tracking-wide uppercase">{e.venue}</p>
              <p className="text-[var(--maroon-900)]/75 mt-4 italic font-display text-xl md:text-2xl">
                &ldquo;{e.note}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
