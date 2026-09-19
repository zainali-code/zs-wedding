import { getGoogleAccessToken } from "@/lib/googleAuth";

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";

async function ensureChildFolder(
  accessToken: string,
  parentId: string,
  name: string
): Promise<string> {
  const safeName = name.replace(/'/g, "\\'");
  const query = new URLSearchParams({
    q: `'${parentId}' in parents and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    pageSize: "1",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });

  const listResponse = await fetch(`${DRIVE_API}?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    throw new Error(
      `Failed to list Drive folders: ${listResponse.status} ${await listResponse.text()}`
    );
  }

  const listed = (await listResponse.json()) as { files?: Array<{ id?: string }> };
  const existingId = listed.files?.[0]?.id;
  if (existingId) return existingId;

  const createResponse = await fetch(`${DRIVE_API}?fields=id&supportsAllDrives=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create Drive folder: ${createResponse.status} ${await createResponse.text()}`
    );
  }

  const created = (await createResponse.json()) as { id?: string };
  if (!created.id) throw new Error(`Drive did not return an id for folder: ${name}`);
  return created.id;
}

async function getOrCreateDateFolder(
  accessToken: string,
  dateLabel: string
): Promise<string> {
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!parentId) throw new Error("Missing GOOGLE_DRIVE_PARENT_FOLDER_ID env var");

  const uploadsRoot = await ensureChildFolder(accessToken, parentId, "Guest Uploads");
  return ensureChildFolder(accessToken, uploadsRoot, dateLabel);
}

export function sanitizeFileName(name: string): string {
  const safe = name.normalize("NFKD").replace(/[^\w.\-() ]/g, "_").slice(0, 150);
  return safe || `file-${Date.now()}`;
}

/**
 * Creates a one-time Drive resumable-upload URL. File bytes then travel
 * directly from the guest browser to Google instead of through this app.
 */
export async function createResumableUploadSession(params: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sessionId: string;
}): Promise<string> {
  const accessToken = await getGoogleAccessToken();
  const dateFolderId = await getOrCreateDateFolder(
    accessToken,
    new Date().toISOString().slice(0, 10)
  );
  const sessionFolderId = await ensureChildFolder(
    accessToken,
    dateFolderId,
    `session-${params.sessionId.slice(0, 10)}`
  );

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": params.mimeType,
        "X-Upload-Content-Length": String(params.sizeBytes),
      },
      body: JSON.stringify({
        name: sanitizeFileName(params.fileName),
        parents: [sessionFolderId],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create resumable session: ${response.status} ${await response.text()}`
    );
  }

  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) throw new Error("Drive did not return an upload session URL");
  return uploadUrl;
}
