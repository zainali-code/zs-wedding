import { BrandLogo } from "./Logo";

export default function Footer() {
  return (
    <footer className="royal-bg relative py-14 px-6 text-center border-t border-[var(--gold-500)]/15">
      <BrandLogo className="w-12 h-12 mx-auto mb-4" size={48} />
      <p className="font-display italic text-xl text-[var(--ivory)]/90">Zain &amp; Sonia</p>
      <p className="text-xs tracking-[0.2em] uppercase text-[var(--gold-300)]/60 mt-2">
        10 · 16 · 18 October 2026 — Karachi, Pakistan
      </p>
      <div className="footer-links flex justify-center gap-8 mt-6 text-sm text-[var(--ivory)]/60">
        <a href="#top" className="hover:text-[var(--gold-300)]">Home</a>
        <a href="#celebration" className="hover:text-[var(--gold-300)]">Celebration</a>
        <a href="#gallery" className="hover:text-[var(--gold-300)]">Nikah Gallery</a>
      </div>
    </footer>
  );
}
