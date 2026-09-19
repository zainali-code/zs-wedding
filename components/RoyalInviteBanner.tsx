"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "closed" | "opening";

export default function RoyalInviteBanner({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const drawLayerRef = useRef<SVGGElement>(null);
  const cracksRef = useRef<SVGSVGElement>(null);
  const typeStrokeRef = useRef<SVGGElement>(null);

  const dust = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        top: `${(i * 17 + 8) % 96}%`,
        left: `${(i * 23 + 4) % 97}%`,
        size: 1.5 + (i % 5) * 0.7,
        delay: (i % 12) * 0.35,
        duration: 4 + (i % 7) * 0.55,
      })),
    []
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  useEffect(() => {
    const roots = [drawLayerRef.current, cracksRef.current, typeStrokeRef.current];
    roots.forEach((root) => {
      root?.querySelectorAll("path, circle, ellipse").forEach((el) => {
        el.setAttribute("pathLength", "1");
      });
    });
  }, []);

  const handleOpen = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    window.setTimeout(onComplete, 6200);
  };

  return (
    <div
      className={`invite-screen${phase === "opening" ? " is-opening" : ""}`}
      role="dialog"
      aria-label="Royal wedding invitation"
    >
      <div className="marble" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className="dust-layer" aria-hidden="true">
        {dust.map((p) => (
          <span
            key={p.id}
            className="gold-dust"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="banner">
        <svg
          className="draw-svg"
          viewBox="0 0 1600 900"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g ref={drawLayerRef} className="draw-layer" filter="url(#goldGlow)">
            <FiligreePaths />
          </g>
        </svg>

        <div className="scene">
          <div className="envelope" onClick={handleOpen} role="presentation">
            <div className="env-pocket" aria-hidden="true" />
            <div className="env-side env-side--left" aria-hidden="true" />
            <div className="env-side env-side--right" aria-hidden="true" />
            <div className="env-liner" aria-hidden="true" />
            <EnvelopeFoil />

            <div className="invite-card">
              <div className="card-frame" />
              <svg className="type-stroke" viewBox="0 0 420 220" aria-hidden="true">
                <g
                  ref={typeStrokeRef}
                  className="type-paths"
                  fill="none"
                  stroke="#D4AF37"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M70 58 C78 38 108 36 118 56 C126 72 104 86 92 98 C80 86 58 72 66 56 C72 44 92 42 102 54" strokeWidth="1.4" />
                  <path d="M188 46 C198 70 212 92 228 110 C214 92 204 70 198 46" strokeWidth="1.35" />
                  <path d="M302 58 C310 38 340 36 350 56 C358 72 336 86 324 98 C312 86 290 72 298 56 C304 44 324 42 334 54" strokeWidth="1.4" />
                  <path d="M90 138 H330" strokeWidth="0.6" opacity="0.75" />
                  <path d="M128 168 C160 156 200 156 232 168 C264 180 200 186 180 176" strokeWidth="0.9" />
                </g>
              </svg>
              <div className="card-copy">
                <p className="card-kicker">The Wedding Of</p>
                <h2 className="card-names">
                  Zain <span>&amp;</span> Sonia
                </h2>
                <div className="card-rule" />
                <p className="card-meta">10 · 16 · 18 October 2026</p>
                <p className="card-venue">Karachi, Pakistan</p>
                <p className="card-events">Rang e Mehndi Festival · Baraat · Valima</p>
              </div>
            </div>

            <div className="flap-slot">
              <div className="flap">
                <div className="flap-front">
                  <FlapOrnament />
                </div>
                <div className="flap-back" />
              </div>
            </div>

            <button
              className="seal"
              onClick={handleOpen}
              disabled={phase === "opening"}
              aria-label="Open royal invitation"
            >
              <svg
                ref={cracksRef}
                className="seal-cracks"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <path d="M50 8 L47 28 L54 42 L46 58 L52 92" stroke="#6b4e12" strokeWidth="1.1" />
                <path d="M50 18 L64 34 L78 40" stroke="#6b4e12" strokeWidth="0.9" />
                <path d="M48 36 L32 48 L22 70" stroke="#6b4e12" strokeWidth="0.9" />
                <path d="M52 62 L68 74 L80 86" stroke="#6b4e12" strokeWidth="0.85" />
              </svg>
              <div className="seal-half seal-half--left">
                <SealFace />
              </div>
              <div className="seal-half seal-half--right">
                <SealFace />
              </div>
            </button>
          </div>

          <p className="prompt">
            {phase === "opening" ? "The invitation unfolds…" : "Break the seal to open"}
          </p>
        </div>
      </div>

      <style>{inviteStyles}</style>
    </div>
  );
}

function FiligreePaths() {
  return (
    <>
      <path d="M56 36 H1544 Q1552 36 1552 44 V856 Q1552 864 1544 864 H56 Q48 864 48 856 V44 Q48 36 56 36 Z" stroke="#D4AF37" strokeWidth="1.1" opacity="0.85" />
      <path d="M68 52 H1536 Q1540 52 1540 56 V844 Q1540 848 1536 848 H68 Q64 848 64 844 V56 Q64 52 68 52 Z" stroke="#D4AF37" strokeWidth="0.45" opacity="0.45" />
      <path d="M220 90 C400 20 600 70 800 42 C1000 14 1200 70 1380 90" stroke="#D4AF37" strokeWidth="1.05" />
      <path d="M260 118 C430 58 620 108 800 78 C980 48 1170 108 1340 118" stroke="#D4AF37" strokeWidth="0.55" opacity="0.7" />
      <path d="M220 810 C400 880 600 830 800 858 C1000 886 1200 830 1380 810" stroke="#D4AF37" strokeWidth="1.05" />
      <path d="M800 70 C760 110 740 150 800 190 C860 150 840 110 800 70 Z" stroke="#D4AF37" strokeWidth="0.8" />
      <circle cx="800" cy="128" r="18" stroke="#D4AF37" strokeWidth="0.7" />
      <circle cx="800" cy="128" r="6" stroke="#D4AF37" strokeWidth="0.8" />
      <path d="M90 160 C140 120 170 200 120 230 C80 250 60 190 90 160 Z" stroke="#D4AF37" strokeWidth="0.85" />
      <path d="M1510 160 C1460 120 1430 200 1480 230 C1520 250 1540 190 1510 160 Z" stroke="#D4AF37" strokeWidth="0.85" />
      <path d="M90 740 C140 780 170 700 120 670 C80 650 60 710 90 740 Z" stroke="#D4AF37" strokeWidth="0.85" />
      <path d="M1510 740 C1460 780 1430 700 1480 670 C1520 650 1540 710 1510 740 Z" stroke="#D4AF37" strokeWidth="0.85" />
      <path d="M180 260 C210 220 250 250 240 290 C230 320 190 310 180 260 Z" stroke="#D4AF37" strokeWidth="0.7" />
      <path d="M1420 260 C1390 220 1350 250 1360 290 C1370 320 1410 310 1420 260 Z" stroke="#D4AF37" strokeWidth="0.7" />
      <path d="M180 640 C210 680 250 650 240 610 C230 580 190 590 180 640 Z" stroke="#D4AF37" strokeWidth="0.7" />
      <path d="M1420 640 C1390 680 1350 650 1360 610 C1370 580 1410 590 1420 640 Z" stroke="#D4AF37" strokeWidth="0.7" />
      <path d="M120 450 C200 390 280 390 360 450" stroke="#D4AF37" strokeWidth="0.55" opacity="0.75" />
      <path d="M1480 450 C1400 390 1320 390 1240 450" stroke="#D4AF37" strokeWidth="0.55" opacity="0.75" />
      <path d="M120 450 C200 510 280 510 360 450" stroke="#D4AF37" strokeWidth="0.55" opacity="0.75" />
      <path d="M1480 450 C1400 510 1320 510 1240 450" stroke="#D4AF37" strokeWidth="0.55" opacity="0.75" />
      <circle cx="180" cy="450" r="28" stroke="#D4AF37" strokeWidth="0.65" />
      <circle cx="180" cy="450" r="10" stroke="#D4AF37" strokeWidth="0.7" />
      <circle cx="1420" cy="450" r="28" stroke="#D4AF37" strokeWidth="0.65" />
      <circle cx="1420" cy="450" r="10" stroke="#D4AF37" strokeWidth="0.7" />
      <path d="M70 70 Q110 70 110 110" stroke="#D4AF37" strokeWidth="0.9" />
      <path d="M1530 70 Q1490 70 1490 110" stroke="#D4AF37" strokeWidth="0.9" />
      <path d="M70 830 Q110 830 110 790" stroke="#D4AF37" strokeWidth="0.9" />
      <path d="M1530 830 Q1490 830 1490 790" stroke="#D4AF37" strokeWidth="0.9" />
      <path d="M480 820 C560 760 640 760 720 820 C800 880 880 880 960 820 C1040 760 1120 760 1200 820" stroke="#D4AF37" strokeWidth="0.6" opacity="0.8" />
    </>
  );
}

function EnvelopeFoil() {
  return (
    <svg className="env-foil" viewBox="0 0 640 400" fill="none" aria-hidden="true">
      <rect x="14" y="14" width="612" height="372" stroke="#D4AF37" strokeWidth="1.2" opacity="0.55" />
      <rect x="22" y="22" width="596" height="356" stroke="#D4AF37" strokeWidth="0.4" opacity="0.35" />
      <path d="M28 48 C52 28 78 28 98 48" stroke="#C9A227" strokeWidth="0.8" opacity="0.7" />
      <path d="M612 48 C588 28 562 28 542 48" stroke="#C9A227" strokeWidth="0.8" opacity="0.7" />
      <path d="M28 352 C52 372 78 372 98 352" stroke="#C9A227" strokeWidth="0.8" opacity="0.7" />
      <path d="M612 352 C588 372 562 372 542 352" stroke="#C9A227" strokeWidth="0.8" opacity="0.7" />
      <path d="M40 70 C70 90 70 130 40 150" stroke="#D4AF37" strokeWidth="0.5" opacity="0.45" />
      <path d="M600 70 C570 90 570 130 600 150" stroke="#D4AF37" strokeWidth="0.5" opacity="0.45" />
    </svg>
  );
}

function FlapOrnament() {
  return (
    <svg className="flap-ornament" viewBox="0 0 640 220" fill="none" aria-hidden="true">
      <path d="M40 16 L320 196 L600 16" stroke="#D4AF37" strokeWidth="1.1" opacity="0.55" />
      <path d="M90 28 C180 88 250 120 320 148 C390 120 460 88 550 28" stroke="#C9A227" strokeWidth="0.7" opacity="0.7" />
      <circle cx="320" cy="168" r="10" stroke="#D4AF37" strokeWidth="0.9" opacity="0.8" />
    </svg>
  );
}

function SealFace() {
  return (
    <div className="seal-face">
      <span className="seal-ring" />
      <span className="seal-mono">Z · S</span>
    </div>
  );
}

const inviteStyles = `
  .invite-screen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0B1B3D;
    overflow: hidden;
  }
  .invite-screen.is-opening {
    animation: screenExit 0.9s ease-in-out 5.3s forwards;
  }
  @keyframes screenExit {
    to { opacity: 0; transform: scale(0.985); }
  }
  .marble {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 18% 22%, rgba(212,175,55,0.14) 0%, transparent 42%),
      radial-gradient(ellipse at 82% 78%, rgba(255,253,249,0.06) 0%, transparent 38%),
      radial-gradient(ellipse at 50% 50%, rgba(12,32,72,0.5) 0%, transparent 70%),
      repeating-linear-gradient(118deg, rgba(255,253,249,0.018) 0 1px, transparent 1px 46px),
      repeating-linear-gradient(32deg, rgba(212,175,55,0.03) 0 1px, transparent 1px 72px),
      linear-gradient(160deg, #071226 0%, #0B1B3D 46%, #06101f 100%);
  }
  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 42%, rgba(3,8,20,0.72) 100%);
  }
  .dust-layer { position: absolute; inset: 0; pointer-events: none; }
  .gold-dust {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, #FFF6D2 0%, #D4AF37 55%, transparent 75%);
    opacity: 0.28;
    animation: dustFloat ease-in-out infinite;
    box-shadow: 0 0 8px rgba(212,175,55,0.55);
  }
  .is-opening .gold-dust { animation-duration: 2.4s; }
  @keyframes dustFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.18; }
    50% { transform: translateY(-14px) scale(1.35); opacity: 0.7; }
  }

  .banner {
    position: relative;
    width: min(96vw, calc(92vh * 16 / 9));
    aspect-ratio: 16 / 9;
    height: auto;
    max-height: 92vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Ensure left/right decorative SVG elements are not clipped */
    overflow: visible;
  }
  @media (max-aspect-ratio: 4/3) {
    .banner {
      width: 100vw;
      height: 100dvh;
      max-height: 100dvh;
      aspect-ratio: auto;
      overflow: hidden;
    }
    .draw-svg {
      width: 100%;
      height: 100%;
    }
    .scene {
      width: min(88vw, 480px);
      gap: 0.75rem;
    }
    .envelope {
      aspect-ratio: 1.55 / 1;
      max-height: 52vh;
      width: 100%;
    }
    .seal {
      width: clamp(56px, 18vw, 84px);
      height: clamp(56px, 18vw, 84px);
    }
    .card-names {
      font-size: clamp(1.4rem, 7vw, 2.2rem);
    }
    .card-kicker, .card-meta, .card-venue, .card-events {
      font-size: clamp(0.44rem, 2.2vw, 0.7rem);
    }
  }
  .draw-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(212,175,55,0.35));
  }
  .draw-layer path,
  .draw-layer circle {
    fill: none;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }
  .is-opening .draw-layer path,
  .is-opening .draw-layer circle {
    animation: drawStroke 2s ease-in-out forwards;
  }
  .is-opening .draw-layer path:nth-child(odd),
  .is-opening .draw-layer circle:nth-child(odd) { animation-delay: 0.7s; }
  .is-opening .draw-layer path:nth-child(even),
  .is-opening .draw-layer circle:nth-child(even) { animation-delay: 0.95s; }
  .is-opening .draw-layer path:nth-child(3n),
  .is-opening .draw-layer circle:nth-child(3n) { animation-delay: 1.15s; }
  @keyframes drawStroke {
    to { stroke-dashoffset: 0; }
  }

  .scene {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: min(520px, 74%);
  }

  .envelope {
    position: relative;
    width: 100%;
    aspect-ratio: 1.65 / 1;
    background:
      radial-gradient(ellipse at 30% 20%, #fffefb 0%, #f4ead3 42%, #e7d7b2 100%);
    border: 1px solid rgba(212,175,55,0.7);
    box-shadow:
      0 0 0 1px rgba(212,175,55,0.18),
      0 18px 60px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,253,249,0.85);
    overflow: visible;
    perspective: 1400px;
    cursor: pointer;
  }
  .env-pocket {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #efe2c4 0%, #e4d2a8 100%);
    clip-path: polygon(0 100%, 0 42%, 50% 68%, 100% 42%, 100% 100%);
    z-index: 1;
  }
  .env-side {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }
  .env-side--left {
    background: linear-gradient(120deg, #f7edd8 0%, #dcc89a 100%);
    clip-path: polygon(0 0, 50% 54%, 0 100%);
  }
  .env-side--right {
    background: linear-gradient(-120deg, #f7edd8 0%, #d4bf90 100%);
    clip-path: polygon(100% 0, 50% 54%, 100% 100%);
  }
  .seal-cracks { opacity: 0; }
  .is-opening .seal-cracks { opacity: 1; }
    position: absolute;
    inset: 8%;
    background: linear-gradient(180deg, rgba(11,27,61,0.06), transparent 40%);
    border: 1px solid rgba(212,175,55,0.18);
    pointer-events: none;
  }
  .env-foil {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .invite-card {
    position: absolute;
    left: 8%;
    right: 8%;
    bottom: 8%;
    height: 78%;
    background: linear-gradient(165deg, #FFFDF9 0%, #f7efdc 100%);
    border: 1px solid rgba(212,175,55,0.45);
    box-shadow: 0 10px 28px rgba(11,27,61,0.18);
    z-index: 2;
    opacity: 0;
    transform: translateY(24%) scale(0.96);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .is-opening .invite-card {
    animation: cardRise 1.05s cubic-bezier(0.22, 1, 0.36, 1) 1.35s forwards;
  }
  @keyframes cardRise {
    to { opacity: 1; transform: translateY(-38%) scale(1); }
  }
  .card-frame {
    position: absolute;
    inset: 10px;
    border: 1px solid rgba(212,175,55,0.35);
    pointer-events: none;
  }
  .type-stroke {
    position: absolute;
    inset: 8% 6% 38%;
    z-index: 1;
  }
  .type-paths path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }
  .is-opening .type-paths path {
    animation: drawStroke 1.1s ease forwards;
    animation-delay: 1.75s;
  }
  .is-opening .type-paths path:nth-child(2) { animation-delay: 1.9s; }
  .is-opening .type-paths path:nth-child(3) { animation-delay: 2.05s; }
  .is-opening .type-paths path:nth-child(4) { animation-delay: 2.2s; }
  .is-opening .type-paths path:nth-child(5) { animation-delay: 2.32s; }
  .card-copy {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 1.1rem 1rem 0.9rem;
    opacity: 0;
  }
  .is-opening .card-copy {
    animation: fillIn 0.85s ease 2.55s forwards;
  }
  @keyframes fillIn {
    to { opacity: 1; }
  }
  .card-kicker {
    font-family: "Cinzel", var(--font-sans);
    font-size: clamp(0.48rem, 1.2vw, 0.68rem);
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: #0B1B3D;
    opacity: 0.72;
    margin-bottom: 0.35rem;
  }
  .card-names {
    font-family: "Great Vibes", var(--font-serif);
    font-size: clamp(1.7rem, 4.6vw, 2.7rem);
    color: #0B1B3D;
    line-height: 1;
    font-weight: 400;
  }
  .card-names span {
    font-family: "Cinzel", serif;
    font-size: 0.42em;
    color: #D4AF37;
    padding: 0 0.15em;
  }
  .card-rule {
    width: 52px;
    height: 1px;
    margin: 0.55rem auto 0.5rem;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  }
  .card-meta, .card-venue, .card-events {
    font-family: "Cinzel", var(--font-sans);
    color: #0B1B3D;
  }
  .card-meta {
    font-size: clamp(0.52rem, 1.3vw, 0.72rem);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0.8;
  }
  .card-venue {
    margin-top: 0.28rem;
    font-size: clamp(0.5rem, 1.15vw, 0.64rem);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.62;
  }
  .card-events {
    margin-top: 0.55rem;
    font-size: clamp(0.46rem, 1.05vw, 0.58rem);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #8a6d1f;
  }

  .flap-slot {
    position: absolute;
    inset: 0 0 auto;
    height: 56%;
    z-index: 4;
    perspective: 1400px;
    pointer-events: none;
  }
  .flap {
    width: 100%;
    height: 100%;
    transform-origin: top center;
    transform-style: preserve-3d;
    transform: rotateX(0deg);
  }
  .is-opening .flap {
    animation: flapOpen 1.15s cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.45s forwards;
  }
  @keyframes flapOpen {
    to { transform: rotateX(-168deg); }
  }
  .flap-front, .flap-back {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
  }
  .flap-front {
    background: linear-gradient(180deg, #fffdf8 0%, #ead9b0 100%);
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    box-shadow: inset 0 -8px 18px rgba(11,27,61,0.08);
  }
  .flap-back {
    background: linear-gradient(180deg, #c9b48a 0%, #dfd0ae 100%);
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    transform: rotateX(180deg);
  }
  .flap-ornament { width: 100%; height: 100%; }

  .seal {
    position: absolute;
    left: 50%;
    top: 52%;
    width: clamp(72px, 12vw, 104px);
    height: clamp(72px, 12vw, 104px);
    transform: translate(-50%, -8%);
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    z-index: 8;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.35));
  }
  .seal:disabled { cursor: default; }
  .seal:hover:not(:disabled) { transform: translate(-50%, -8%) scale(1.05); }
  .is-opening .seal {
    animation: sealPulse 0.22s ease-out;
    pointer-events: none;
  }
  @keyframes sealPulse {
    50% { transform: translate(-50%, -8%) scale(1.08); }
  }
  .seal-half {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .seal-half--left { clip-path: inset(0 50% 0 0); }
  .seal-half--right { clip-path: inset(0 0 0 50%); }
  .is-opening .seal-half--left {
    animation: sealLeft 0.55s ease-in 0.2s forwards;
  }
  .is-opening .seal-half--right {
    animation: sealRight 0.55s ease-in 0.2s forwards;
  }
  @keyframes sealLeft {
    to { transform: translate(-28px, 18px) rotate(-28deg); opacity: 0; }
  }
  @keyframes sealRight {
    to { transform: translate(32px, 22px) rotate(32deg); opacity: 0; }
  }
  .seal-face {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 34% 30%, #f3d77a 0%, #D4AF37 38%, #b8860b 68%, #7a5a12 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.35),
      inset 0 -3px 6px rgba(0,0,0,0.28);
  }
  .seal-ring {
    position: absolute;
    inset: 7px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 236, 170, 0.45);
  }
  .seal-mono {
    font-family: "Cinzel", serif;
    font-size: clamp(0.72rem, 1.6vw, 0.95rem);
    letter-spacing: 0.14em;
    color: #3a2a08;
    text-shadow: 0 1px 0 rgba(255,236,170,0.35);
    position: relative;
    z-index: 1;
  }
  .seal-cracks {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }
  .seal-cracks path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }
  .is-opening .seal-cracks path {
    animation: drawStroke 0.32s ease-out forwards;
  }
  .is-opening .seal-cracks path:nth-child(2) { animation-delay: 0.05s; }
  .is-opening .seal-cracks path:nth-child(3) { animation-delay: 0.1s; }
  .is-opening .seal-cracks path:nth-child(4) { animation-delay: 0.15s; }

  .prompt {
    font-family: "Cinzel", var(--font-sans);
    font-size: clamp(0.58rem, 1.2vw, 0.72rem);
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #D4AF37;
    opacity: 0.8;
    animation: promptPulse 3s ease-in-out infinite;
  }
  @keyframes promptPulse {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 0.95; }
  }

  @media (max-width: 700px) {
    .scene { width: min(88vw, 480px); gap: 0.75rem; }
    .invite-screen { overflow: hidden; }
    .banner { width: 100vw; height: 100dvh; max-height: 100dvh; aspect-ratio: auto; }
  }
  @media (max-width: 430px) {
    .scene { width: 92vw; gap: 0.6rem; }
    .envelope { aspect-ratio: 1.45 / 1; max-height: 48vh; }
    .card-names { font-size: clamp(1.2rem, 8vw, 1.7rem); }
    .prompt { font-size: clamp(0.52rem, 2.8vw, 0.68rem); letter-spacing: 0.22em; }
  }
`;
