import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

// Renders an elegant maroon-on-cream QR code pointing at /upload.
// Never encodes the Google Drive URL — only our own /upload route.
export async function GET(req: NextRequest) {
  const site = process.env.SITE_URL || req.nextUrl.origin;
  const target = `${site}/upload`;

  const png = await QRCode.toBuffer(target, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 480,
    color: {
      dark: "#5A1526", // deep maroon
      light: "#F7F1E6", // warm ivory
    },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
