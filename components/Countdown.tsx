"use client";

import { useEffect, useState } from "react";
import { getActiveCountdownEvent } from "@/lib/events";

function splitDuration(ms: number) {
  const clamped = Math.max(ms, 0);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    mins: Math.floor((totalSeconds % 3600) / 60),
    secs: totalSeconds % 60,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const event = now == null ? getActiveCountdownEvent() : getActiveCountdownEvent(now);
  const time =
    now == null || !event
      ? { days: 0, hours: 0, mins: 0, secs: 0 }
      : splitDuration(new Date(event.start).getTime() - now);

  if (now != null && !event) {
    return (
      <div className="hero-countdown flex flex-col items-center gap-3">
        <p className="font-display italic text-xl text-[var(--ivory)]">With love, always</p>
        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-[var(--champagne)]/70">
          The celebrations have begun
        </p>
      </div>
    );
  }

  return (
    <div className="hero-countdown">
      <div className="hero-countdown-units" role="timer" aria-label={`Countdown to the ${event?.label}`}>
        {[
          { label: "Days", value: time.days },
          { label: "Hours", value: time.hours },
          { label: "Mins", value: time.mins },
          { label: "Secs", value: time.secs },
        ].map((u, i, arr) => (
          <div key={u.label} className="hero-countdown-unit-wrap">
            <div className="hero-countdown-unit">
              <span className="hero-countdown-value">{pad(u.value)}</span>
              <span className="hero-countdown-label">{u.label}</span>
            </div>
            {i < arr.length - 1 && <span className="hero-countdown-separator" aria-hidden="true">:</span>}
          </div>
        ))}
      </div>
      <p className="hero-countdown-caption">
        Until {event?.label} · {event?.dateLabel.replace(" 2026", "")}
      </p>
    </div>
  );
}
