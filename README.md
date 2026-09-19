# Zain & Sonia — Wedding Website (Next.js, free-tier architecture)

A royal maroon/gold wedding microsite with a secure guest photo/video upload
flow into a private Google Drive folder — built to run entirely on free
infrastructure (Vercel/Netlify + Google's free APIs).

## What changed from the original site
- Rebuilt from static PHP/MySQL → **Next.js 14 (App Router)**, because PHP +
  MySQL cannot run on Vercel/Netlify's free serverless hosting.
- **Removed:** Share Invitation (all buttons/links/JS), RSVP section
  (heading, form, nav item, JS), Leave a Message / guestbook.
- **"Share the Album" → "Share Your Memories"**: redesigned as the site's
  main interactive moment, with upload CTA + QR code.
- **Royal visual redesign**: deep maroon/burgundy + antique gold + ivory
  palette, Cormorant Garamond (display serif) + Inter (sans), a GSAP-driven
  envelope-to-Hero reveal with royal path drawing, glyph-by-glyph name tracing,
  synchronized low-volume opening music, editorial event cards, asymmetric
  gallery, and `prefers-reduced-motion` support. The page scroll lock is applied
  only while the opening timeline is running and is defensively restored when
  the animation completes or is interrupted.
- **Logo**: the optimized Z&S logo is served from `public/logo/zs-logo-256.png`
  through the shared `components/Logo.tsx` component.
- **Invitation audio**: the selected wedding track is stored at
  `public/audio/royal-invitation.mp3`. It starts only after the guest clicks the
  envelope (browser-autoplay safe), fades in with the opening sequence, loops, and
  can be muted with the floating control. The audio element uses `preload="none"`
  so the 15+ minute track is not downloaded during the initial page load.
- **September 2026 Hero/celebration visual update**: the final Hero now uses the
  supplied royal invitation composition with the provided left carriage and right
  pavilion artwork, a gold framed maroon stationery treatment, boxed countdown,
  grouped navigation, and a slower GSAP sequence (envelope -> path drawing ->
  ornaments -> name lettering -> final locked Hero). The three Celebration cards
  use the supplied Rang e Mehndi Festival, Baraat carriage, and Dawat-e-Walima assets directly.

## Architecture (why it's free)

```
Guest Browser
   1. POST email  ─────────────►  /api/upload-init  (Vercel function)
   ◄──── signed upload token ────

   2. POST file metadata ──────►  /api/upload/session (Vercel function)
                                    -> asks Google Drive (service account)
                                       to open a "resumable upload session"
   ◄──── one-time Drive upload URL

   3. PUT the file bytes directly to that Google URL (NOT through Vercel)

   4. POST completion ─────────►  /api/upload/complete
                                    -> logs metadata to a Google Sheet
```

- **No paid database.** For this wedding-sized workload, the `Guests` and
  `Uploads` tabs in a private **Google Sheet** act as the lightweight datastore.
  The same service account writes to it, so there is no separate database bill.
  If you later want SQL/reporting/admin features, Neon or Supabase can replace
  this logging layer without changing the Drive upload architecture.
- **No exposed Drive folder.** Guests never get a Drive link, never see
  other guests' files, and never receive Drive credentials. Only the
  server-side service account can see the folder; guests only ever get a
  single-use upload URL scoped to one destination folder.
- **Why the browser uploads directly to Google (step 3):** Vercel's Hobby
  (free) plan caps a serverless function's request body at ~4.5MB. Wedding
  videos are almost always bigger than that. Routing files through our own
  API would make video uploads fail. Instead the server opens a Google
  Drive *resumable upload session* (this step requires our secret
  credentials) and hands the browser a one-time URL; the browser then PUTs
  the file straight to Google, bypassing our function entirely. This is the
  standard pattern for large uploads on serverless hosts.
- **No secrets in the frontend.** All Google credentials live only in
  `lib/drive.ts` / `lib/sheet.ts`, which run server-side only (Vercel
  serverless functions), reading from environment variables.

## Recommended zero-cost deployment architecture

For this project, the simplest no-paid-infrastructure setup is:

- **Frontend + backend APIs:** Next.js on **Vercel Hobby** (recommended for this
  Next.js app) or Netlify Free.
- **Large media uploads:** browser -> Google Drive resumable upload URL directly.
  The file bytes never pass through Vercel/Netlify.
- **Google authentication:** Service Account credentials stored only as hosting
  environment variables.
- **File storage:** Google Workspace Shared Drive (or Workspace user via
  Domain-Wide Delegation).
- **Lightweight database:** private Google Sheet for guest/upload metadata.
- **Secrets:** `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
  `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_DRIVE_PARENT_FOLDER_ID`,
  `GOOGLE_SHEETS_ID`, `UPLOAD_TOKEN_SECRET`, and `SITE_URL`.

This architecture is deliberately serverless and avoids paid persistent
servers. Stay within each provider's free-tier quotas; free plans have hard
usage limits and can change over time.

## One-time setup

### 1. Google Cloud service account
1. Go to console.cloud.google.com -> create/select a project.
2. Enable the **Google Drive API** and **Google Sheets API**.
3. IAM & Admin -> Service Accounts -> Create service account (no project
   roles needed).
4. Open the service account -> Keys -> Add key -> JSON. Download it.
5. From the JSON, copy `client_email` -> `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and
   `private_key` -> `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep the `\n`
   characters exactly as they appear in the JSON string).

### 2. Google Drive destination for a Service Account
For a **service-account-only** upload flow, use one of these supported setups:

**Recommended: Google Workspace Shared Drive**
1. Create or choose a Shared Drive in your Google Workspace account.
2. Add the service account email as a **Content manager** (or another role that
   can create files/folders).
3. Create a destination folder such as `Wedding Guest Uploads` inside that
   Shared Drive.
4. Copy that folder ID into `GOOGLE_DRIVE_PARENT_FOLDER_ID`.
5. Leave `GOOGLE_IMPERSONATED_USER_EMAIL` empty. The Drive client already sends
   `supportsAllDrives=true`, so uploads and generated subfolders work in Shared
   Drives.

**Alternative: Google Workspace Domain-Wide Delegation**
If your Workspace administrator authorizes Domain-Wide Delegation for the
service account, set `GOOGLE_IMPERSONATED_USER_EMAIL` to the Workspace user the
service account should impersonate. Files are then created on behalf of that
real user.

> Important: a normal personal Gmail/My Drive folder is not a reliable target
> for a pure service-account upload flow because service accounts do not have
> personal Drive storage quota and cannot own Drive files. If you only have a
> personal Gmail account, use a user OAuth flow instead of service-account-only
> uploads.

The app automatically creates `Guest Uploads/<date>/session-.../` subfolders
inside the configured destination.

### 3. Google Sheet (free database)
1. Create a new Google Sheet, e.g. "Wedding Uploads Log".
2. Add two tabs named exactly `Guests` and `Uploads`.
   - `Guests` header row: `timestamp | email | session_id | ip_hash`
   - `Uploads` header row: `timestamp | session_id | email | file_name | mime_type | size_bytes | drive_file_id | status`
3. Share the Sheet with the same service account email (Editor).
4. Copy the Sheet ID from its URL into `GOOGLE_SHEETS_ID`.

### 4. Environment variables
Copy `.env.example` to `.env.local` for local dev, and add the same keys in
your hosting provider's dashboard for production:
- Vercel: Project -> Settings -> Environment Variables.
- Netlify: Site configuration -> Environment variables.

Also generate `UPLOAD_TOKEN_SECRET` with `openssl rand -hex 32`, and set
`SITE_URL` to your deployed domain once you have it (used for CSRF/origin
checks and as the QR code target).

### 5. Install & run locally
```bash
npm install
npm run dev
```

### 6. Deploy
- **Vercel** (recommended, zero config): push to GitHub, import the repo at
  vercel.com/new, add the environment variables, deploy. Free Hobby plan is
  sufficient.
- **Netlify**: install the Next.js Runtime plugin (`@netlify/plugin-nextjs`,
  auto-detected) and add the same environment variables.

## Free-tier limits worth knowing
- **Vercel Hobby functions**: request/response payloads are capped at 4.5 MB.
  That is why guest photos/videos bypass the function after the resumable
  session is created and upload directly to Google Drive. Current Vercel Hobby
  function duration is more than sufficient for these small metadata calls.
- **Google Drive API**: default free quota is generous for a single wedding
  (per-user rate limits in the thousands/day); a personal Google account
  also gives 15GB of Drive storage shared across Gmail/Photos/Drive — keep
  an eye on total guest upload volume if you expect many large videos.
- **Google Sheets API**: default 60 write requests/minute per user, far
  more than a wedding needs.
- **In-memory rate limiting** (`lib/rateLimit.ts`) is best-effort only,
  since serverless instances are stateless/ephemeral. The real abuse guards
  are the signed, time-limited upload token and the per-session upload cap
  checked against the Sheet log. If you outgrow this, Upstash's free Redis
  tier is a natural upgrade (see comments in `lib/rateLimit.ts`).

## Project structure
```
app/
  page.tsx                Home page (assembles all sections)
  upload/page.tsx          Guest upload flow (email -> files -> progress -> thank you)
  api/upload-init/         Email intake, issues signed upload token
  api/upload/session/      Opens a Drive resumable upload session
  api/upload/complete/     Logs finished upload to the Google Sheet
  api/qr/                  Generates the QR code image (points at /upload only)
components/                Nav, Hero, Events, Gallery, ShareMemories, Footer, Logo
lib/
  drive.ts                 Google Drive service-account logic (server-only)
  sheet.ts                 Google Sheets logging (server-only)
  token.ts                 Signed upload-session tokens
  validate.ts              File type/size rules
  rateLimit.ts             Best-effort in-memory rate limiting
```

## Still to do before launch
- Replace the 6 placeholder gallery SVGs in `public/gallery/` with real
  photos.
- Update event details in `lib/events.ts` if needed.
- Test the full upload flow end-to-end once environment variables are set
  (a local `.env.local` + `npm run dev` is enough to test before deploying).
