import Image from "next/image";

export default function ShareMemories() {
  return (
    <section id="memories" className="section-ivory relative py-24 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <p className="eyebrow text-[var(--maroon-800)]">Your Perspective, Preserved</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3 text-[var(--maroon-950)]">Share Your Memories</h2>
        <div className="divider-line my-6" />
        <p className="text-[var(--maroon-900)]/70 max-w-lg mx-auto text-sm md:text-base">
          Captured a special moment? Add your photos and videos to our private wedding collection —
          we&rsquo;d love to see the day through your eyes.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Upload CTA */}
        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <div className="bg-[var(--cream)] border border-[var(--gold-500)]/20 rounded-sm px-8 py-8 w-full flex flex-col items-center md:items-start gap-4">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--maroon-900)]/50">Step 1</p>
            <h3 className="font-display text-2xl text-[var(--maroon-950)]">Upload Your Photos</h3>
            <p className="text-sm text-[var(--maroon-900)]/65 max-w-xs">
              Tap the button below to securely share your photos. We&rsquo;ll only ask for your email to keep your
              upload private.
            </p>
            <a href="/upload" className="btn-royal-dark btn-royal mt-2 text-sm px-7 py-3.5">
              Upload Your Photos
            </a>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-[var(--cream)] border border-[var(--gold-500)]/20 rounded-sm px-8 py-8 w-full flex flex-col items-center gap-4">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--maroon-900)]/50">Step 1 — alternative</p>
            <h3 className="font-display text-2xl text-[var(--maroon-950)]">Scan to Share</h3>
            <div className="p-3 bg-white rounded-sm border border-[var(--gold-500)]/25 inline-block">
              <Image src="/api/qr" alt="QR code to upload your wedding photos" width={140} height={140} unoptimized />
            </div>
            <p className="text-xs tracking-wide text-[var(--maroon-900)]/50 text-center">
              Point your camera at the code above
            </p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-[var(--maroon-900)]/45 max-w-md mx-auto text-center">
        Your photos go straight into our private collection and are never made public.
      </p>
    </section>
  );
}
