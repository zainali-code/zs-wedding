import { NextRequest, NextResponse } from "next/server";
import { verifyUploadToken } from "@/lib/token";
import { logUploadRecord } from "@/lib/sheet";
import { sanitizeFileName } from "@/lib/drive";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { token, fileName, mimeType, sizeBytes, driveFileId, status } = body || {};

    if (!token || !fileName || !driveFileId) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    let payload;
    try {
      payload = verifyUploadToken(token);
    } catch {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }

    await logUploadRecord({
      sessionId: payload.sessionId,
      email: payload.email,
      fileName: sanitizeFileName(fileName),
      mimeType: mimeType || "unknown",
      sizeBytes: Number(sizeBytes) || 0,
      driveFileId,
      status: status === "failed" ? "failed" : "success",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not record upload." }, { status: 500 });
  }
}
