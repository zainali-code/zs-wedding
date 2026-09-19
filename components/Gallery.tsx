"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryImage = {
  src: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
  tag: string;
};

const IMAGES: GalleryImage[] = [
  {
    src: "/gallery/nikah-stage.jpg",
    width: 2048,
    height: 1173,
    caption: "The Nikah Moment",
    alt: "Bride and groom seated for the Nikah ceremony in front of the floral stage",
    tag: "01",
  },
  {
    src: "/gallery/nikah-hands.JPG",
    width: 1440,
    height: 1919,
    caption: "A Promise Held Close",
    alt: "Close-up of the couple holding hands during the Nikah celebration",
    tag: "02",
  },
  {
    src: "/gallery/nikah-couple-walk.JPG",
    width: 1440,
    height: 1919,
    caption: "Side by Side",
    alt: "Bride and groom walking together at the Nikah celebration",
    tag: "03",
  },
  {
    src: "/gallery/nikah-celebration.JPG",
    width: 2048,
    height: 1362,
    caption: "Celebration & Joy",
    alt: "Family and friends celebrating around the couple at the Nikah event",
    tag: "04",
  },
  {
    src: "/gallery/nikah-qawwali.JPG",
    width: 2048,
    height: 1365,
    caption: "An Evening of Music",
    alt: "Musicians performing during the Nikah celebration",
    tag: "05",
  },
  {
    src: "/gallery/nikah-welcome.JPG",
    width: 1200,
    height: 1600,
    caption: "Welcome to Our Nikah",
    alt: "Floral Nikah ceremony welcome sign",
    tag: "06",
  },
];

/* Balanced desktop columns preserve every photo's original aspect ratio.
   No face or important detail is cropped in the gallery itself. */
const DESKTOP_COLUMNS = [
  [0, 1],
  [5, 4],
  [2, 3],
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") {
        setLightbox((index) => ((index ?? 0) + 1) % IMAGES.length);
      }
      if (event.key === "ArrowLeft") {
        setLightbox((index) => ((index ?? 0) - 1 + IMAGES.length) % IMAGES.length);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <section id="gallery" className="royal-bg relative py-24 px-5">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="eyebrow">A Few Sacred Moments</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Nikah Event Highlights</h2>
        <div className="divider-line my-6" />
        <p className="text-[var(--ivory)]/60 max-w-lg mx-auto text-sm">
          A quiet collection of moments from our Nikah celebration.
        </p>
      </div>

      <div className="gallery-editorial-grid max-w-6xl mx-auto" aria-label="Nikah Event Highlights">
        {DESKTOP_COLUMNS.map((column, columnIndex) => (
          <div className="gallery-editorial-column" key={columnIndex}>
            {column.map((imageIndex) => (
              <GalleryCell
                key={IMAGES[imageIndex].src}
                img={IMAGES[imageIndex]}
                onOpen={() => setLightbox(imageIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="gallery-mobile-masonry" aria-label="Nikah Event Highlights">
        {IMAGES.map((img, index) => (
          <GalleryCell key={img.src} img={img} onOpen={() => setLightbox(index)} />
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="gallery-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Nikah photo lightbox"
        >
          <button
            type="button"
            className="gallery-lb-close"
            onClick={() => setLightbox(null)}
            aria-label="Close photo"
          >
            x
          </button>

          <button
            type="button"
            className="gallery-lb-nav gallery-lb-nav--prev"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox((index) => ((index ?? 0) - 1 + IMAGES.length) % IMAGES.length);
            }}
            aria-label="Previous photo"
          >
            &larr;
          </button>

          <div className="gallery-lb-content" onClick={(event) => event.stopPropagation()}>
            <Image
              src={IMAGES[lightbox].src}
              alt={IMAGES[lightbox].alt}
              width={IMAGES[lightbox].width}
              height={IMAGES[lightbox].height}
              sizes="90vw"
              className="gallery-lb-img"
              priority
            />
            <div className="gallery-lb-caption">
              <span className="gallery-lb-cap-text">{IMAGES[lightbox].caption}</span>
              <span className="gallery-lb-counter">
                {String(lightbox + 1).padStart(2, "0")} / {String(IMAGES.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="gallery-lb-nav gallery-lb-nav--next"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox((index) => ((index ?? 0) + 1) % IMAGES.length);
            }}
            aria-label="Next photo"
          >
            &rarr;
          </button>

          <div className="gallery-lb-dots" aria-label="Choose photo">
            {IMAGES.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`gallery-lb-dot${index === lightbox ? " gallery-lb-dot--active" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox(index);
                }}
                aria-label={`Photo ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function GalleryCell({ img, onOpen }: { img: GalleryImage; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="gallery-card"
      onClick={onOpen}
      aria-label={`Open photo: ${img.caption}`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={img.width}
        height={img.height}
        sizes="(min-width: 768px) 33vw, (min-width: 560px) 50vw, 100vw"
        className="gallery-card-img"
      />
      <span className="gallery-card-shade" aria-hidden="true" />
      <span className="gallery-card-tag">{img.tag}</span>
      <span className="gallery-card-caption">{img.caption}</span>
    </button>
  );
}
