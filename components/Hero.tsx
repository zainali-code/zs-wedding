"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { BrandLogo } from "./Logo";
import Countdown from "./Countdown";

type HeroPhase = "sealed" | "opening" | "revealed";

const MUSIC_VOLUME = 0.12;
const OPENING_SAFETY_MS = 14000;

export default function Hero() {
  const [phase, setPhase] = useState<HeroPhase>("sealed");
  const [musicPlaying, setMusicPlaying] = useState(false);

  const envelopeScreenRef = useRef<HTMLDivElement>(null);
  const envelopeBackdropRef = useRef<HTMLDivElement>(null);
  const bismillahStageRef = useRef<HTMLDivElement>(null);
  const envelopeWrapRef = useRef<HTMLSpanElement>(null);
  const envelopeBodyRef = useRef<HTMLSpanElement>(null);
  const sealRef = useRef<HTMLSpanElement>(null);
  const flapRef = useRef<HTMLSpanElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const topIconRef = useRef<HTMLSpanElement>(null);
  const royalPathLayerRef = useRef<SVGSVGElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openingFinishedRef = useRef(false);

  const restorePageScroll = useCallback(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    html.removeAttribute("data-invitation-scroll-lock");
    body.removeAttribute("data-invitation-scroll-lock");
    html.classList.remove("invitation-locked");
    body.classList.remove("invitation-locked");

    for (const element of [html, body]) {
      element.style.removeProperty("overflow");
      element.style.removeProperty("overflow-y");
      element.style.removeProperty("overscroll-behavior");
      element.style.removeProperty("touch-action");
      element.style.removeProperty("position");
      element.style.removeProperty("height");
      element.style.removeProperty("top");
      element.style.removeProperty("width");
    }
  }, []);

  const lockPageScroll = useCallback(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    html.setAttribute("data-invitation-scroll-lock", "true");
    body.setAttribute("data-invitation-scroll-lock", "true");
    html.style.overflow = "hidden";
    html.style.overflowY = "hidden";
    body.style.overflow = "hidden";
    body.style.overflowY = "hidden";
  }, []);

  useEffect(() => {
    if (phase === "opening") {
      lockPageScroll();
    } else {
      restorePageScroll();
    }

    return restorePageScroll;
  }, [phase, lockPageScroll, restorePageScroll]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (timelineRef.current) {
        timelineRef.current.eventCallback("onInterrupt", null);
        timelineRef.current.eventCallback("onComplete", null);
        timelineRef.current.kill();
      }
      restorePageScroll();
      audio?.pause();
    };
  }, [restorePageScroll]);

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    gsap.killTweensOf(audio);
    audio.volume = 0;
    audio.currentTime = 0;

    void audio
      .play()
      .then(() => setMusicPlaying(true))
      .catch(() => setMusicPlaying(false));
  };

  const setHeroFinalState = useCallback(() => {
    const heroSection = heroSectionRef.current;
    const pathLayer = royalPathLayerRef.current;
    if (!heroSection) return;

    const introItems = heroSection.querySelectorAll<HTMLElement>("[data-hero-intro]");
    const afterNameItems = heroSection.querySelectorAll<HTMLElement>("[data-hero-after-name]");
    const leftOrnaments = heroSection.querySelectorAll<HTMLElement>("[data-ornament-left]");
    const rightOrnaments = heroSection.querySelectorAll<HTMLElement>("[data-ornament-right]");
    const frameOrnaments = heroSection.querySelectorAll<HTMLElement>("[data-ornament-frame]");
    const nameGlyphs = heroSection.querySelectorAll<SVGElement>("[data-name-letter]");
    const nameGuide = heroSection.querySelector<SVGPathElement>("[data-name-guide]");
    const paths = pathLayer
      ? Array.from(pathLayer.querySelectorAll<SVGPathElement>("[data-royal-path]"))
      : [];

    gsap.set(heroSection, { autoAlpha: 1 });
    gsap.set(introItems, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
    gsap.set(afterNameItems, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
    gsap.set(frameOrnaments, { autoAlpha: 1, scale: 1 });
    gsap.set(leftOrnaments, {
      autoAlpha: 1,
      clipPath: "inset(0 0% 0 0)",
      scale: 1,
      filter: "blur(0px)",
    });
    gsap.set(rightOrnaments, {
      autoAlpha: 1,
      clipPath: "inset(0 0 0 0%)",
      scale: 1,
      filter: "blur(0px)",
    });
    gsap.set(nameGlyphs, {
      strokeDashoffset: 0,
      strokeOpacity: 0.32,
      fillOpacity: 1,
    });
    if (nameGuide) {
      gsap.set(nameGuide, {
        strokeDashoffset: 0,
        autoAlpha: 0.34,
      });
    }
    gsap.set(pathLayer, { autoAlpha: 1 });
    gsap.set(paths, { strokeDashoffset: 0 });
  }, []);

  const finishOpening = useCallback(() => {
    if (openingFinishedRef.current) return;
    openingFinishedRef.current = true;

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    // Lock the exact last drawing frame before removing the envelope overlay.
    // There is no second Hero and therefore no visual handoff/swap here.
    setHeroFinalState();
    restorePageScroll();

    const envelopeScreen = envelopeScreenRef.current;
    if (envelopeScreen) {
      envelopeScreen.style.pointerEvents = "none";
      envelopeScreen.style.visibility = "hidden";
    }

    setPhase("revealed");

    requestAnimationFrame(() => {
      restorePageScroll();
      requestAnimationFrame(restorePageScroll);
    });
  }, [restorePageScroll, setHeroFinalState]);

  const handleOpen = () => {
    if (phase !== "sealed") return;

    const envelopeScreen = envelopeScreenRef.current;
    const envelopeBackdrop = envelopeBackdropRef.current;
    const bismillahStage = bismillahStageRef.current;
    const envelopeWrap = envelopeWrapRef.current;
    const seal = sealRef.current;
    const flap = flapRef.current;
    const prompt = promptRef.current;
    const topIcon = topIconRef.current;
    const pathLayer = royalPathLayerRef.current;
    const heroSection = heroSectionRef.current;
    const audio = audioRef.current;

    if (
      !envelopeScreen ||
      !envelopeBackdrop ||
      !bismillahStage ||
      !envelopeWrap ||
      !seal ||
      !flap ||
      !heroSection ||
      !pathLayer
    ) {
      restorePageScroll();
      setHeroFinalState();
      setPhase("revealed");
      return;
    }

    openingFinishedRef.current = false;
    lockPageScroll();
    setPhase("opening");
    startMusic();

    safetyTimerRef.current = setTimeout(finishOpening, OPENING_SAFETY_MS);

    if (window.scrollY !== 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    const introItems = heroSection.querySelectorAll<HTMLElement>("[data-hero-intro]");
    const afterNameItems = heroSection.querySelectorAll<HTMLElement>("[data-hero-after-name]");
    const leftOrnaments = heroSection.querySelectorAll<HTMLElement>("[data-ornament-left]");
    const rightOrnaments = heroSection.querySelectorAll<HTMLElement>("[data-ornament-right]");
    const frameOrnaments = heroSection.querySelectorAll<HTMLElement>("[data-ornament-frame]");
    const nameGlyphs = heroSection.querySelectorAll<SVGElement>("[data-name-letter]");
    const nameGuide = heroSection.querySelector<SVGPathElement>("[data-name-guide]");
    const paths = Array.from(pathLayer.querySelectorAll<SVGPathElement>("[data-royal-path]"));

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    timelineRef.current?.kill();

    if (reduceMotion) {
      setHeroFinalState();
      gsap.set(bismillahStage, { autoAlpha: 0 });

      const reducedTl = gsap.timeline({
        onComplete: finishOpening,
        onInterrupt: finishOpening,
      });
      timelineRef.current = reducedTl;

      reducedTl
        .to(envelopeWrap, { autoAlpha: 0, duration: 0.18, ease: "none" })
        .to(bismillahStage, { autoAlpha: 1, duration: 0.22, ease: "none" })
        .to(bismillahStage, { autoAlpha: 1, duration: 1.35, ease: "none" })
        .to(bismillahStage, { autoAlpha: 0, duration: 0.22, ease: "none" })
        .to(envelopeBackdrop, { autoAlpha: 0, duration: 0.24, ease: "none" });
      return;
    }

    gsap.set(heroSection, { autoAlpha: 1 });
    gsap.set(bismillahStage, {
      autoAlpha: 0,
      scale: 0.985,
      filter: "blur(3px)",
      transformOrigin: "50% 50%",
    });
    gsap.set(introItems, {
      autoAlpha: 0,
      y: 12,
      filter: "blur(4px)",
    });
    gsap.set(afterNameItems, {
      autoAlpha: 0,
      y: 14,
      filter: "blur(4px)",
    });
    gsap.set(frameOrnaments, {
      autoAlpha: 0,
      scale: 0.992,
      transformOrigin: "50% 50%",
    });
    gsap.set(leftOrnaments, {
      autoAlpha: 0,
      clipPath: "inset(0 100% 0 0)",
      scale: 0.985,
      transformOrigin: "0% 100%",
      filter: "blur(2px)",
    });
    gsap.set(rightOrnaments, {
      autoAlpha: 0,
      clipPath: "inset(0 0 0 100%)",
      scale: 0.985,
      transformOrigin: "100% 100%",
      filter: "blur(2px)",
    });
    gsap.set(nameGlyphs, {
      strokeDasharray: 360,
      strokeDashoffset: 360,
      strokeOpacity: 0,
      fillOpacity: 0,
    });
    if (nameGuide) {
      gsap.set(nameGuide, {
        strokeDasharray: 1100,
        strokeDashoffset: 1100,
        autoAlpha: 0,
      });
    }
    gsap.set(pathLayer, { autoAlpha: 1 });
    paths.forEach((path) => {
      const length = Math.max(path.getTotalLength(), 1);
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

    const viewportHeight = window.innerHeight;
    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: finishOpening,
      onInterrupt: finishOpening,
    });
    timelineRef.current = tl;

    tl.to(
      prompt,
      {
        autoAlpha: 0,
        y: 8,
        duration: 0.42,
        ease: "power2.out",
      },
      0
    )
      .to(
        topIcon,
        {
          autoAlpha: 0,
          y: -4,
          duration: 0.34,
          ease: "power1.out",
        },
        0.08
      )
      .to(
        seal,
        {
          autoAlpha: 0,
          scale: 0.68,
          y: -16,
          rotation: 8,
          duration: 0.66,
          ease: "power3.in",
        },
        0.14
      )
      .to(
        flap,
        {
          rotationX: -178,
          duration: 1.42,
          ease: "power3.inOut",
        },
        0.4
      )
      .to(
        envelopeWrap,
        {
          y: Math.min(155, viewportHeight * 0.15),
          scale: 0.92,
          autoAlpha: 0,
          filter: "blur(3px)",
          duration: 1.2,
          ease: "power3.in",
        },
        1.34
      )
      .to(
        bismillahStage,
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.72,
          ease: "sine.out",
        },
        1.92
      )
      .to(
        bismillahStage,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1.35,
          ease: "none",
        },
        2.64
      )
      .to(
        bismillahStage,
        {
          autoAlpha: 0,
          scale: 1.012,
          filter: "blur(2px)",
          duration: 0.72,
          ease: "sine.inOut",
        },
        3.99
      )
      .to(
        envelopeBackdrop,
        {
          autoAlpha: 0,
          duration: 1.1,
          ease: "sine.inOut",
        },
        4.72
      )
      .to(
        paths,
        {
          strokeDashoffset: 0,
          duration: 3.1,
          stagger: 0.11,
          ease: "power1.inOut",
        },
        4.98
      )
      .to(
        frameOrnaments,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          stagger: 0.1,
          ease: "sine.out",
        },
        5.15
      )
      .to(
        leftOrnaments,
        {
          autoAlpha: 1,
          clipPath: "inset(0 0% 0 0)",
          scale: 1,
          filter: "blur(0px)",
          duration: 2.1,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        5.3
      )
      .to(
        rightOrnaments,
        {
          autoAlpha: 1,
          clipPath: "inset(0 0 0 0%)",
          scale: 1,
          filter: "blur(0px)",
          duration: 2.1,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        5.44
      )
      .to(
        introItems,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.82,
          stagger: 0.16,
          ease: "power3.out",
        },
        5.95
      );

    if (nameGuide) {
      tl.to(
        nameGuide,
        {
          autoAlpha: 0.34,
          strokeDashoffset: 0,
          duration: 1.55,
          ease: "sine.inOut",
        },
        6.32
      );
    }

    tl.to(
      nameGlyphs,
      {
        strokeOpacity: 0.95,
        duration: 0.1,
        stagger: 0.13,
      },
      6.55
    )
      .to(
        nameGlyphs,
        {
          strokeDashoffset: 0,
          duration: 0.7,
          stagger: 0.13,
          ease: "power1.inOut",
        },
        6.61
      )
      .to(
        nameGlyphs,
        {
          fillOpacity: 1,
          strokeOpacity: 0.32,
          duration: 0.45,
          stagger: 0.13,
          ease: "sine.out",
        },
        6.94
      )
      .to(
        afterNameItems,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.78,
          stagger: 0.11,
          ease: "power3.out",
        },
        8.05
      );

    // The path layer is deliberately NOT faded out. Its final drawn state is
    // the final Hero artwork; finishOpening only removes the now-invisible
    // envelope overlay and restores scrolling.
    if (audio) {
      tl.to(audio, { volume: 0.04, duration: 1.0, ease: "sine.out" }, 0.2)
        .to(audio, { volume: 0.08, duration: 1.5, ease: "sine.inOut" }, 1.25)
        .to(audio, { volume: 0.09, duration: 1.8, ease: "sine.inOut" }, 3.0)
        .to(audio, { volume: MUSIC_VOLUME, duration: 1.4, ease: "sine.out" }, 5.8);
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    gsap.killTweensOf(audio);

    if (musicPlaying) {
      gsap.to(audio, {
        volume: 0,
        duration: 0.55,
        ease: "sine.out",
        onComplete: () => {
          audio.pause();
          setMusicPlaying(false);
        },
      });
      return;
    }

    audio.volume = 0;
    void audio
      .play()
      .then(() => {
        setMusicPlaying(true);
        gsap.to(audio, {
          volume: MUSIC_VOLUME,
          duration: 0.8,
          ease: "sine.out",
        });
      })
      .catch(() => setMusicPlaying(false));
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/royal-invitation.mp3"
        preload="none"
        loop
        aria-hidden="true"
      />

      {phase !== "revealed" && (
        <div
          ref={envelopeScreenRef}
          className={`envelope-screen${phase === "opening" ? " is-opening" : ""}`}
          aria-hidden={phase === "opening" ? "true" : undefined}
        >
          <div ref={envelopeBackdropRef} className="envelope-backdrop" aria-hidden="true" />

          <div ref={bismillahStageRef} className="bismillah-stage" aria-hidden="true">
            <div className="bismillah-stage-inner">
              <Image
                src="/artwork/bismillah-opening.jpg"
                alt=""
                width={1571}
                height={1001}
                sizes="(max-width: 640px) 92vw, 760px"
                className="bismillah-stage-image"
                priority
              />
            </div>
          </div>

          <button
            type="button"
            className="env-trigger"
            onClick={handleOpen}
            disabled={phase !== "sealed"}
            aria-label="Open Zain and Sonia's royal wedding invitation"
          >
            <span ref={envelopeWrapRef} className="env-wrap">
              <span ref={envelopeBodyRef} className="env-body" aria-hidden="true">
                <CornerFiligree pos="tl" />
                <CornerFiligree pos="tr" />
                <CornerFiligree pos="bl" />
                <CornerFiligree pos="br" />

                <span ref={topIconRef} className="env-top-icon">
                  <TrumpetIcon />
                </span>

                <span className="env-paper-hint">
                  <BrandLogo className="env-paper-hint-logo" size={74} />
                  <span className="env-paper-hint-kicker">The Wedding Of</span>
                  <span className="env-paper-hint-names">Zain &amp; Sonia</span>
                </span>

                <span className="env-pocket env-pocket--left" />
                <span className="env-pocket env-pocket--right" />
                <span className="env-pocket env-pocket--bottom" />

                <span ref={flapRef} className="env-flap">
                  <span className="env-flap-face" />
                  <span className="env-flap-back" />
                </span>

                <span ref={sealRef} className="env-seal">
                  <span className="env-seal-outer" />
                  <span className="env-seal-inner" />
                  <BrandLogo className="env-seal-logo" size={58} priority />
                </span>
              </span>

              <span ref={promptRef} className="env-prompt">
                <span className="env-prompt-main">Tap to Open Royal Invitation</span>
                <span className="env-prompt-rule" />
              </span>
            </span>
          </button>
        </div>
      )}

      <section
        ref={heroSectionRef}
        id="top"
        className={`hero-main royal-bg relative flex items-center justify-center overflow-hidden${phase === "revealed" ? " is-revealed" : " is-pre-reveal"}`}
        aria-hidden={phase === "sealed"}
      >
        <HeroContent pathRef={royalPathLayerRef} />
      </section>

      {phase === "revealed" && (
        <button
          type="button"
          className={`music-toggle${musicPlaying ? " is-playing" : ""}`}
          onClick={toggleMusic}
          aria-label={musicPlaying ? "Pause wedding background music" : "Play wedding background music"}
          aria-pressed={musicPlaying}
        >
          <MusicIcon playing={musicPlaying} />
          <span>{musicPlaying ? "Music on" : "Music off"}</span>
        </button>
      )}
    </>
  );
}

function HeroContent({ pathRef }: { pathRef: RefObject<SVGSVGElement> }) {
  return (
    <div className="royal-invite-scene">
      <RoyalPathDrawing svgRef={pathRef} />

      <div data-ornament-frame className="hero-invitation-frame" aria-hidden="true">
        <span className="hero-frame-corner hero-frame-corner--tl" />
        <span className="hero-frame-corner hero-frame-corner--tr" />
        <span className="hero-frame-corner hero-frame-corner--bl" />
        <span className="hero-frame-corner hero-frame-corner--br" />
      </div>

      <div data-ornament-left className="hero-side-art hero-side-art--left" aria-hidden="true">
        <img src="/artwork/hero-left.png" alt="" draggable="false" />
      </div>
      <div data-ornament-right className="hero-side-art hero-side-art--right" aria-hidden="true">
        <img src="/artwork/hero-right.png" alt="" draggable="false" />
      </div>

      <div className="hero-center-vignette" aria-hidden="true" />

      <div className="hero-content relative text-center mx-auto">
        <div data-hero-intro className="hero-center-logo" aria-hidden="true">
          <BrandLogo className="hero-center-logo-image" size={96} priority />
        </div>
        <p data-hero-intro className="hero-kicker">The Wedding Of</p>

        <h1 className="sr-only">Zain &amp; Sonia</h1>
        <RoyalNameDrawing />

        <p data-hero-after-name className="hero-date-line">
          10 · 16 · 18 October 2026 <span aria-hidden="true">—</span> Karachi, Pakistan
        </p>
        <div data-hero-after-name className="hero-divider" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
        <div data-hero-after-name className="hero-countdown-wrap">
          <Countdown />
        </div>
        <p data-hero-after-name className="hero-quote">
          &ldquo;With love, laughter, and the beginning of forever.&rdquo;
        </p>
        <div data-hero-after-name className="hero-actions">
          <a href="#celebration" className="hero-royal-button">
            <span>Venue &amp; Direction</span>
          </a>
          {/* Share Your Memories button hidden while section is off */}
          {/* <a href="/upload" className="hero-royal-button">
            <span>Share Your Memories</span>
          </a> */}
        </div>
      </div>
    </div>
  );
}

function RoyalNameDrawing() {
  const characters = Array.from("Zain & Sonia");

  return (
    <div className="royal-name-drawing" aria-hidden="true">
      <svg
        className="royal-name-svg"
        viewBox="0 0 1000 190"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <text
          x="500"
          y="135"
          textAnchor="middle"
          xmlSpace="preserve"
          className="royal-name-text"
        >
          {characters.map((character, index) => {
            const visibleCharacter = character === " " ? "\u00A0" : character;
            const isDrawable = character !== " ";
            const isAmpersand = character === "&";

            return (
              <tspan
                key={`${character}-${index}`}
                {...(isDrawable ? { "data-name-letter": "true" } : {})}
                className={isAmpersand ? "royal-name-glyph royal-name-glyph--amp" : "royal-name-glyph"}
              >
                {visibleCharacter}
              </tspan>
            );
          })}
        </text>
      </svg>
    </div>
  );
}

const RoyalPathDrawing = ({
  svgRef,
}: {
  svgRef: RefObject<SVGSVGElement>;
}) => (
  <svg
    ref={svgRef}
    className="royal-path-layer"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      data-royal-path
      className="royal-path-frame"
      d="M96 118 Q96 74 140 74 H860 Q904 74 904 118 V882 Q904 926 860 926 H140 Q96 926 96 882 Z"
    />
    <path
      data-royal-path
      className="royal-path-flourish"
      d="M98 786 C122 801 146 822 150 855 C154 822 178 798 214 794 C177 789 154 763 150 728 C145 763 121 785 98 786 Z M902 786 C878 801 854 822 850 855 C846 822 822 798 786 794 C823 789 846 763 850 728 C855 763 879 785 902 786 Z"
    />
    <path
      data-royal-path
      className="royal-path-fine"
      d="M247 892 C279 862 320 855 363 873 C408 892 455 890 500 858 C545 890 592 892 637 873 C680 855 721 862 753 892"
    />
  </svg>
);

function CornerFiligree({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg
      className={`env-corner env-corner--${pos}`}
      viewBox="0 0 84 84"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 2H39C18 5 6 18 2 39V2Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M3 3H34M3 3V34" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7 7C20 7 28 15 28 28" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <path d="M4 28C13 27 21 19 22 10" stroke="currentColor" strokeWidth="0.9" opacity="0.72" />
      <path d="M14 5C15 11 19 15 25 16C19 18 15 22 14 28C12 22 9 18 3 16C9 14 12 11 14 5Z" fill="currentColor" fillOpacity="0.27" />
      <path d="M31 4C31 10 35 14 41 14C35 16 31 20 31 26C29 20 25 16 19 14C25 13 29 10 31 4Z" stroke="currentColor" strokeWidth="0.8" opacity="0.52" />
      <path d="M5 40C11 40 15 44 15 50C17 44 21 40 27 40C21 38 17 34 15 28C14 34 11 38 5 40Z" stroke="currentColor" strokeWidth="0.8" opacity="0.52" />
      <circle cx="4" cy="4" r="2.2" fill="currentColor" opacity="0.72" />
    </svg>
  );
}

function TrumpetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 16L9.2 9.8H13.5L19.8 4.9L22 7.1L16.2 13.7V17.2C13 21.1 9.4 21.2 7 19.8L4.8 17.2L3 16Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M3 16C1.9 17.2 2.2 18.8 4.2 19.4" stroke="currentColor" strokeWidth="1" />
      <circle cx="14.2" cy="9.4" r="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function MusicIcon({ playing }: { playing: boolean }) {
  if (!playing) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9v6h4l5 4V5L9 9H5Z" />
        <path d="M18 9l4 6M22 9l-4 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9.5c1.3 1.4 1.3 3.6 0 5M19.5 7c2.8 2.8 2.8 7.2 0 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
