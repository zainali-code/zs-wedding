"use client";

import { useCallback, useRef, useState } from "react";
import { BrandLogo } from "@/components/Logo";

type Stage = "email" | "upload" | "done";

interface QueuedFile {
  file: File;
  id: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let driveFileId = "unknown";
        try {
          const body = JSON.parse(xhr.responseText);
          driveFileId = body.id || driveFileId;
        } catch {
          // Drive should always return JSON here; fall back gracefully.
        }
        resolve(driveFileId);
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailError(null);
      setSubmitting(true);
      try {
        const res = await fetch("/api/upload-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setEmailError(data.error || "Something went wrong.");
          return;
        }
        setToken(data.token);
        setStage("upload");
      } catch {
        setEmailError("Could not reach the server. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [email]
  );

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const next: QueuedFile[] = Array.from(fileList).map((file) => ({
      file,
      id: uid(),
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...next]);
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const startUpload = useCallback(async () => {
    if (!token) return;
    for (const qf of files) {
      if (qf.status === "done") continue;
      setFiles((prev) => prev.map((f) => (f.id === qf.id ? { ...f, status: "uploading" } : f)));
      try {
        const sessionRes = await fetch("/api/upload/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            fileName: qf.file.name,
            mimeType: qf.file.type,
            sizeBytes: qf.file.size,
          }),
        });
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) throw new Error(sessionData.error || "Could not start upload");

        const driveFileId = await uploadWithProgress(sessionData.uploadUrl, qf.file, (pct) => {
          setFiles((prev) => prev.map((f) => (f.id === qf.id ? { ...f, progress: pct } : f)));
        });

        await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            fileName: qf.file.name,
            mimeType: qf.file.type,
            sizeBytes: qf.file.size,
            driveFileId,
            status: "success",
          }),
        });

        setFiles((prev) => prev.map((f) => (f.id === qf.id ? { ...f, status: "done", progress: 100 } : f)));
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === qf.id ? { ...f, status: "error", error: err instanceof Error ? err.message : "Upload failed" } : f
          )
        );
      }
    }
    setStage("done");
  }, [files, token]);

  return (
    <main className="royal-bg min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <BrandLogo className="w-16 h-16 mx-auto mb-6" size={64} />

        {stage === "email" && (
          <div>
            <p className="eyebrow mb-3">Share Your Memories</p>
            <h1 className="font-display text-3xl md:text-4xl mb-3">Add Your Photos &amp; Videos</h1>
            <p className="text-[var(--ivory)]/70 mb-8 text-sm">
              We&rsquo;ll use your email only to keep your upload private and secure. No account, no password.
            </p>
            <form onSubmit={submitEmail} className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border border-[var(--gold-500)]/40 rounded-sm px-4 py-3 text-center text-[var(--ivory)] placeholder:text-[var(--ivory)]/40 focus:outline-none focus:border-[var(--gold-500)]"
              />
              {emailError && <p className="text-sm text-red-300">{emailError}</p>}
              <button type="submit" disabled={submitting} className="btn-royal justify-center disabled:opacity-50">
                {submitting ? "Please wait…" : "Continue"}
              </button>
            </form>
          </div>
        )}

        {stage === "upload" && (
          <div>
            <p className="eyebrow mb-3">Add Your Memories</p>
            <h1 className="font-display text-3xl md:text-4xl mb-6">Upload Your Photos &amp; Videos</h1>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer border border-dashed rounded-sm py-12 px-6 transition-colors ${
                dragOver ? "border-[var(--gold-300)] bg-[var(--gold-500)]/10" : "border-[var(--gold-500)]/40"
              }`}
            >
              <p className="text-[var(--gold-300)] text-sm tracking-wide">+ Select Photos &amp; Videos</p>
              <p className="text-xs text-[var(--ivory)]/40 mt-2">or drag and drop here</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <ul className="mt-6 flex flex-col gap-3 text-left max-h-64 overflow-y-auto pr-1">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate">{f.file.name}</span>
                    {f.status === "pending" && (
                      <button onClick={() => removeFile(f.id)} className="text-[var(--ivory)]/40 hover:text-[var(--ivory)] text-xs">
                        Remove
                      </button>
                    )}
                    {f.status === "uploading" && <span className="text-[var(--gold-300)] text-xs">{f.progress}%</span>}
                    {f.status === "done" && <span className="text-green-400 text-xs">✓</span>}
                    {f.status === "error" && <span className="text-red-300 text-xs">{f.error || "Failed"}</span>}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={startUpload}
              disabled={files.length === 0}
              className="btn-royal justify-center w-full mt-8 disabled:opacity-40"
            >
              Upload Memories
            </button>
          </div>
        )}

        {stage === "done" && (
          <div>
            <div className="mx-auto mb-6 w-16 h-16 rounded-full border border-[var(--gold-500)] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold-300)" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="font-display text-3xl md:text-4xl mb-3">Thank You</h1>
            <p className="text-[var(--ivory)]/70">Your memories have been added to our wedding collection.</p>
            {files.some((f) => f.status === "error") && (
              <p className="text-sm text-red-300 mt-4">
                Some files didn&rsquo;t upload successfully — you can go back and try again for those.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
