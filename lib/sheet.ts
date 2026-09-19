import { getGoogleAccessToken } from "@/lib/googleAuth";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

function getSheetId(): string {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEETS_ID env var");
  return sheetId;
}

async function appendValues(range: string, values: Array<Array<string | number>>) {
  const accessToken = await getGoogleAccessToken();
  const sheetId = getSheetId();
  const url = `${SHEETS_API}/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to append Sheet values: ${response.status} ${await response.text()}`
    );
  }
}

async function getValues(range: string): Promise<unknown[][]> {
  const accessToken = await getGoogleAccessToken();
  const sheetId = getSheetId();
  const url = `${SHEETS_API}/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to read Sheet values: ${response.status} ${await response.text()}`
    );
  }

  const data = (await response.json()) as { values?: unknown[][] };
  return data.values ?? [];
}

export async function logGuestSession(params: {
  email: string;
  sessionId: string;
  ipHash: string;
}) {
  await appendValues("Guests!A:D", [
    [new Date().toISOString(), params.email, params.sessionId, params.ipHash],
  ]);
}

export async function logUploadRecord(params: {
  sessionId: string;
  email: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  driveFileId: string;
  status: "success" | "failed";
}) {
  await appendValues("Uploads!A:H", [
    [
      new Date().toISOString(),
      params.sessionId,
      params.email,
      params.fileName,
      params.mimeType,
      params.sizeBytes,
      params.driveFileId,
      params.status,
    ],
  ]);
}

export async function countUploadsForSession(sessionId: string): Promise<number> {
  const rows = await getValues("Uploads!B:B");
  return rows.filter((row) => row[0] === sessionId).length;
}
