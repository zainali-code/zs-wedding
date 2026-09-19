import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Guests never get a Drive credential or a password. Instead, after they
 * submit their email we issue a short-lived, signed JWT ("upload session
 * token") that authorizes POSTs to /api/upload for a limited window.
 * This avoids needing any server-side session store (no DB round trip),
 * which keeps the whole thing running on free serverless functions.
 */

const SECRET = process.env.UPLOAD_TOKEN_SECRET;

export interface UploadTokenPayload {
  email: string;
  sessionId: string;
}

export function issueUploadToken(email: string): { token: string; sessionId: string } {
  if (!SECRET) throw new Error("Missing UPLOAD_TOKEN_SECRET env var");
  const sessionId = crypto.randomBytes(12).toString("hex");
  const token = jwt.sign({ email, sessionId } as UploadTokenPayload, SECRET, {
    expiresIn: "2h",
  });
  return { token, sessionId };
}

export function verifyUploadToken(token: string): UploadTokenPayload {
  if (!SECRET) throw new Error("Missing UPLOAD_TOKEN_SECRET env var");
  return jwt.verify(token, SECRET) as UploadTokenPayload;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function hashIp(ip: string): string {
  const salt = process.env.UPLOAD_TOKEN_SECRET || "salt";
  return crypto.createHash("sha256").update(ip + salt).digest("hex").slice(0, 16);
}
