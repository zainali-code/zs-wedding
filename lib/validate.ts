export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

// Google Drive itself can take large files; the practical ceiling here is
// mostly to keep abuse/storage in check on a free-tier Drive account.
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB per file
export const MAX_FILES_PER_SESSION = 40;

export function isAllowedFile(mimeType: string, sizeBytes: number): { ok: boolean; reason?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { ok: false, reason: "Only photos and videos are allowed." };
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { ok: false, reason: "File is too large." };
  }
  return { ok: true };
}
