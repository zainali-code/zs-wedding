"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "./Logo";

const LINKS = [
  { href: "#celebration", label: "Celebration" },
  { href: "#gallery", label: "Nikah Gallery" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? " site-nav--scrolled" : ""}`} aria-label="Primary">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center" aria-label="Home">
          <BrandLogo className="site-nav-logo" size={72} priority />
        </a>
        <div className="hidden md:flex items-center gap-3">
          <div className="site-nav-links-panel">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="site-nav-link">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <button
          className="md:hidden text-[var(--ivory)] p-1"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <div className={`w-6 h-px bg-current mb-1.5 transition-transform origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-6 h-px bg-current mb-1.5 transition-opacity ${open ? "opacity-0" : ""}`} />
          <div className={`w-6 h-px bg-current transition-transform origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "280px" : "0" }}
      >
        <div className="bg-[var(--maroon-950)]/97 px-5 pb-5 pt-2 flex flex-col gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[var(--ivory)]/90 py-2.5 text-sm border-b border-[var(--gold-500)]/10 last:border-0"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
