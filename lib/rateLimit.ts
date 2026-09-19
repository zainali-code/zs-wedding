/**
 * Best-effort rate limiting that needs no external service (stays free).
 *
 * IMPORTANT LIMITATION: Vercel/Netlify serverless functions are stateless
 * and may run on any instance, so this in-memory map only limits requests
 * that happen to land on the same warm instance. It stops casual abuse
 * (a bot hammering the endpoint in a burst) but is NOT a hard guarantee.
 * The durable guard against real abuse is:
 *   1. The signed, short-lived upload token (can't upload without an email
 *      step first).
 *   2. The per-session upload count check against the Google Sheet log
 *      (see lib/sheet.ts -> countUploadsForSession).
 * If you outgrow this, swap in Upstash Redis's free tier (works great with
 * Vercel Edge/serverless and has a generous free quota) — see README.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
