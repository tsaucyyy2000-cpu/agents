/**
 * Patient ↔ support messaging shell — browser localStorage only.
 * Non-durable demo store. Not a clinic chart, SMS, or email provider.
 * Toast/email-style previews must never include message body or medical detail.
 */

export const SUPPORT_STORE_KEY = "ro-clone-support-messages-v1";

export type ThreadStatus = "open" | "pending" | "closed";

export type MessageAuthor = "patient" | "support";

export type AttachmentMeta = {
  /** Original filename only — bytes are never stored. */
  fileName: string;
  /** Reported size in bytes (metadata). */
  sizeBytes: number;
  /** MIME type string when the browser provides one. */
  mimeType: string;
};

export type SupportMessage = {
  id: string;
  author: MessageAuthor;
  /** Free-text body shown only inside the thread UI — never in toast previews. */
  body: string;
  createdAt: string;
  attachment?: AttachmentMeta;
};

export type SupportThread = {
  id: string;
  /** Short subject line for list UIs (also kept out of toast previews). */
  subject: string;
  /** Patient identity key (email when signed in; preview id in design mode). */
  patientKey: string;
  patientLabel: string;
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

export type SupportStore = {
  version: 1;
  threads: SupportThread[];
};

/** Safe, non-PHI notification copy for toast / email-style previews. */
export const SAFE_NOTIFY = {
  patientSent: "Your message was sent to support.",
  supportReplied: "Support replied to your conversation.",
  statusChanged: "Your support conversation status was updated.",
  attachmentRejected:
    "This demo does not accept medical document uploads. Only a filename stub can be noted — file bytes are never stored.",
  attachmentNoted: "Attachment noted as filename metadata only — file contents were not saved.",
} as const;

const EMPTY_STORE: SupportStore = { version: 1, threads: [] };

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadSupportStore(): SupportStore {
  try {
    const raw = localStorage.getItem(SUPPORT_STORE_KEY);
    if (!raw) return { ...EMPTY_STORE, threads: [] };
    const parsed = JSON.parse(raw) as Partial<SupportStore>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.threads)) {
      return { ...EMPTY_STORE, threads: [] };
    }
    return {
      version: 1,
      threads: parsed.threads.filter(isThreadShape),
    };
  } catch {
    return { ...EMPTY_STORE, threads: [] };
  }
}

function isThreadShape(value: unknown): value is SupportThread {
  if (!value || typeof value !== "object") return false;
  const t = value as SupportThread;
  return (
    typeof t.id === "string" &&
    typeof t.subject === "string" &&
    typeof t.patientKey === "string" &&
    typeof t.patientLabel === "string" &&
    (t.status === "open" || t.status === "pending" || t.status === "closed") &&
    typeof t.createdAt === "string" &&
    typeof t.updatedAt === "string" &&
    Array.isArray(t.messages)
  );
}

export function saveSupportStore(store: SupportStore): void {
  localStorage.setItem(SUPPORT_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("ro-support-store-changed"));
}

export function listThreadsForPatient(patientKey: string): SupportThread[] {
  const key = patientKey.trim().toLowerCase();
  return loadSupportStore()
    .threads.filter((t) => t.patientKey.toLowerCase() === key)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listAllThreads(): SupportThread[] {
  return [...loadSupportStore().threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getThread(threadId: string): SupportThread | undefined {
  return loadSupportStore().threads.find((t) => t.id === threadId);
}

export type CreateThreadInput = {
  patientKey: string;
  patientLabel: string;
  subject: string;
  body: string;
  attachment?: AttachmentMeta;
};

export function createThread(input: CreateThreadInput): SupportThread {
  const createdAt = nowIso();
  const message: SupportMessage = {
    id: newId("msg"),
    author: "patient",
    body: input.body.trim(),
    createdAt,
    ...(input.attachment ? { attachment: input.attachment } : {}),
  };
  const thread: SupportThread = {
    id: newId("thr"),
    subject: input.subject.trim() || "Support request",
    patientKey: input.patientKey.trim(),
    patientLabel: input.patientLabel.trim() || input.patientKey.trim(),
    status: "open",
    createdAt,
    updatedAt: createdAt,
    messages: [message],
  };
  const store = loadSupportStore();
  store.threads.unshift(thread);
  saveSupportStore(store);
  return thread;
}

export type ReplyInput = {
  threadId: string;
  author: MessageAuthor;
  body: string;
  attachment?: AttachmentMeta;
  /** When support replies, default next status is pending (awaiting patient). */
  nextStatus?: ThreadStatus;
};

export function replyToThread(input: ReplyInput): SupportThread | undefined {
  const store = loadSupportStore();
  const idx = store.threads.findIndex((t) => t.id === input.threadId);
  if (idx < 0) return undefined;
  const thread = store.threads[idx];
  const createdAt = nowIso();
  const message: SupportMessage = {
    id: newId("msg"),
    author: input.author,
    body: input.body.trim(),
    createdAt,
    ...(input.attachment ? { attachment: input.attachment } : {}),
  };
  let status = input.nextStatus ?? thread.status;
  if (!input.nextStatus) {
    if (input.author === "support" && thread.status !== "closed") status = "pending";
    if (input.author === "patient" && thread.status === "pending") status = "open";
    if (input.author === "patient" && thread.status === "closed") status = "open";
  }
  const updated: SupportThread = {
    ...thread,
    status,
    updatedAt: createdAt,
    messages: [...thread.messages, message],
  };
  store.threads[idx] = updated;
  saveSupportStore(store);
  return updated;
}

export function setThreadStatus(threadId: string, status: ThreadStatus): SupportThread | undefined {
  const store = loadSupportStore();
  const idx = store.threads.findIndex((t) => t.id === threadId);
  if (idx < 0) return undefined;
  const updated: SupportThread = {
    ...store.threads[idx],
    status,
    updatedAt: nowIso(),
  };
  store.threads[idx] = updated;
  saveSupportStore(store);
  return updated;
}

/**
 * Build attachment metadata from a File, or reject with honest copy.
 * Never reads or stores file bytes.
 */
export function noteAttachmentStub(file: File | null | undefined): {
  ok: true;
  meta: AttachmentMeta;
  notice: string;
} | {
  ok: false;
  notice: string;
} {
  if (!file) {
    return { ok: false, notice: SAFE_NOTIFY.attachmentRejected };
  }
  // Reject obvious clinical document patterns with clear copy; still never store bytes.
  const lower = file.name.toLowerCase();
  const risky =
    /\.(dcm|dicom|hl7|fhir)$/i.test(lower) ||
    /lab[-_\s]?result|medical[-_\s]?record|phi|hipaa|prescription|chart/i.test(lower);
  if (risky) {
    return { ok: false, notice: SAFE_NOTIFY.attachmentRejected };
  }
  return {
    ok: true,
    meta: {
      fileName: file.name.slice(0, 180),
      sizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
    },
    notice: SAFE_NOTIFY.attachmentNoted,
  };
}

/** Subject/body for list rows only — truncated; never used as a toast payload. */
export function threadPreviewLine(thread: SupportThread, max = 72): string {
  const last = thread.messages[thread.messages.length - 1];
  const raw = last?.body?.trim() || thread.subject;
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1)}…`;
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function subscribeSupportStore(onChange: () => void): () => void {
  const handler = () => onChange();
  window.addEventListener("ro-support-store-changed", handler);
  window.addEventListener("storage", (e) => {
    if (e.key === SUPPORT_STORE_KEY) onChange();
  });
  return () => {
    window.removeEventListener("ro-support-store-changed", handler);
  };
}
