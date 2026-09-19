import { NextRequest, NextResponse } from "next/server";
import { verifyUploadToken } from "@/lib/token";
import { createResumableUploadSession } from "@/lib/drive";
import { isAllowedFile, MAX_FILES_PER_SESSION } from "@/lib/validate";
import { countUploadsForSession } from "@/lib/sheet";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "";
    const allowedOrigin = process.env.SITE_URL;
    if (allowedOrigin && origin && !origin.startsWith(allowedOrigin)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`session:${ip}`, 60, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const { token, fileName, mimeType, sizeBytes } = body || {};

    if (!token || !fileName || !mimeType || !sizeBytes) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    let payload;
    try {
      payload = verifyUploadToken(token);
    } catch {
      return NextResponse.json({ error: "Your session has expired. Please enter your email again." }, { status: 401 });
    }

    const check = isAllowedFile(mimeType, Number(sizeBytes));
    if (!check.ok) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    // Abuse guard: cap total files per email session, checked against the log.
    try {
      const existingCount = await countUploadsForSession(payload.sessionId);
      if (existingCount >= MAX_FILES_PER_SESSION) {
        return NextResponse.json(
          { error: "Upload limit reached for this session. Thank you for sharing so many memories!" },
          { status: 429 }
        );
      }
    } catch (e) {
      console.error("Could not check upload count (continuing):", e);
    }

    const uploadUrl = await createResumableUploadSession({
      fileName,
      mimeType,
      sizeBytes: Number(sizeBytes),
      sessionId: payload.sessionId,
    });

    return NextResponse.json({ uploadUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not start upload. Please try again." }, { status: 500 });
  }
}
