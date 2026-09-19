# Wedding Website Update Notes - 2026-09-19

## Completed

- Replaced the placeholder Gallery with a **Nikah Event Highlights** gallery using the six supplied Nikah photographs.
- Gallery images retain their original aspect ratios in the page layout to avoid heavy cropping of faces or important details.
- Lightbox uses `object-fit: contain` so the complete image remains visible.
- Removed **Share Memories** from the desktop/mobile navigation and footer, and stopped rendering the ShareMemories section on the homepage.
- Preserved `components/ShareMemories.tsx`, `/upload`, and the upload/API functionality in the codebase for future reactivation.
- Added the supplied Bismillah artwork to the invitation opening flow:
  1. Envelope opens.
  2. Bismillah artwork fades in and holds briefly.
  3. Bismillah fades out.
  4. The main wedding banner reveal begins.
- Bismillah artwork uses its full aspect ratio and responsive `object-fit: contain`; a very light edge feather (CSS mask) blends the card into the backdrop for a smooth fade in/out.

## Music - integrated

- Replaced the previous background track with the supplied MP3.
- The track remains at `public/audio/royal-invitation.mp3`, so the existing music controls and animation hooks continue to work without structural changes.
- Playback still begins from the envelope click, which keeps it browser-autoplay safe.
- Existing GSAP volume fades, looping behavior, and the floating music toggle are preserved.
- Changed the audio element from `preload="auto"` to `preload="none"` so the long MP3 is not downloaded during the initial page load. The browser begins loading/streaming it only after the guest opens the invitation or turns the music back on.
- Supplied audio format verified as MP3, MPEG Layer III, 192 kbps, 44.1 kHz stereo, approximately 15 minutes 39 seconds.

## Mughal ornamental assets - pending isolated files

The supplied numbered ornament image is useful as a visual reference, but it contains multiple elements, labels, and a background in one flattened image. For clean production placement, provide each chosen ornament as a separate asset, ideally transparent PNG/WebP or SVG.

Planned selective placement:

- **Ornamental side border:** hero/banner edge accent and, if composition permits, one major section transition only.
- **Z&S crest:** one focal brand moment, not repeated throughout every section.
- **Decorative leaf/vine:** restrained corner accents around the Nikah gallery/header or section dividers.
- **Ceremonial/ring ornament:** a single accent near the celebration/event content if it balances the composition.

The goal is to keep the Mughal language consistent without making the page visually crowded.
