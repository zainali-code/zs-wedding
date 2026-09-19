import { NextRequest, NextResponse } from "next/server";
import { issueUploadToken, isValidEmail, hashIp } from "@/lib/token";
import { logGuestSession } from "@/lib/sheet";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Basic CSRF/origin guard: only accept requests that came from our own site.
    const origin = req.headers.get("origin") || "";
    const allowedOrigin = process.env.SITE_URL;
    if (allowedOrigin && origin && !origin.startsWith(allowedOrigin)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`init:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const email = (body?.email || "").toString().trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const { token, sessionId } = issueUploadToken(email);

    // Log the session (best-effort — don't block the guest if Sheets hiccups).
    try {
      await logGuestSession({ email, sessionId, ipHash: hashIp(ip) });
    } catch (e) {
      console.error("Failed to log guest session", e);
    }

    return NextResponse.json({ token, sessionId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
