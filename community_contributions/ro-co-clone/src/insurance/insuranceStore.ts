/**
 * Insurance assistance shell — browser localStorage only.
 * Non-operational until a contracted payer partner is wired.
 * Never claims coverage, eligibility, approval, or prior-auth success.
 */

export const INSURANCE_STORE_KEY = "ro-clone-insurance-inquiries-v1";

/**
 * Admin/demo workflow statuses only.
 * Intentionally excludes approved / covered / eligible / authorized.
 */
export type InsuranceReviewStatus =
  | "submitted"
  | "under_review"
  | "needs_documents"
  | "info_incomplete"
  | "closed";

export type InsuranceDocStub = {
  /** Original filename only — bytes are never stored. */
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  notedAt: string;
};

export type InsuranceDetails = {
  carrier: string;
  memberId: string;
  groupNumber: string;
  subscriberName: string;
  planType: string;
  relationship: string;
  notes: string;
};

export type InsuranceInquiry = {
  id: string;
  patientKey: string;
  patientLabel: string;
  source: "account" | "funnel";
  details: InsuranceDetails;
  /** Always false until a verified payer API is connected. */
  payerVerified: false;
  status: InsuranceReviewStatus;
  /** Admin/demo label only — never an eligibility determination. */
  statusLabel: string;
  documents: InsuranceDocStub[];
  adminNote: string;
  operational: false;
  createdAt: string;
  updatedAt: string;
};

export type InsuranceStore = {
  version: 1;
  inquiries: InsuranceInquiry[];
};

export const INSURANCE_STATUS_LABEL: Record<InsuranceReviewStatus, string> = {
  submitted: "Submitted · awaiting admin review (demo)",
  under_review: "Under admin review (demo)",
  needs_documents: "Documents requested · admin demo",
  info_incomplete: "Info incomplete · admin demo",
  closed: "Closed · no eligibility determination (demo)",
};

export const INSURANCE_STATUS_OPTIONS: InsuranceReviewStatus[] = [
  "submitted",
  "under_review",
  "needs_documents",
  "info_incomplete",
  "closed",
];

export const PLAN_TYPE_OPTIONS = [
  "PPO (placeholder)",
  "HMO (placeholder)",
  "EPO (placeholder)",
  "Other / unknown (placeholder)",
] as const;

export const RELATIONSHIP_OPTIONS = [
  "Self",
  "Spouse / partner",
  "Dependent",
  "Other",
] as const;

/** Safe toast / preview copy — never includes member IDs or coverage claims. */
export const SAFE_INSURANCE_NOTIFY = {
  inquirySaved: "Insurance inquiry saved locally. No payer was contacted.",
  detailsUpdated: "Insurance details updated in this browser only.",
  documentNoted: "Document noted as filename metadata only — file contents were not saved.",
  documentRejected:
    "This demo does not store insurance card or clinical document bytes. Only a filename stub can be noted.",
  statusUpdated: "Admin demo status updated. This is not an eligibility determination.",
  cleared: "Local insurance inquiry was cleared from this browser.",
} as const;

export const PAYER_UNVERIFIED_COPY =
  "No verified payer · coverage never claimed without a contracted eligibility partner";

const EMPTY_STORE: InsuranceStore = { version: 1, inquiries: [] };

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isStatus(value: unknown): value is InsuranceReviewStatus {
  return (
    value === "submitted" ||
    value === "under_review" ||
    value === "needs_documents" ||
    value === "info_incomplete" ||
    value === "closed"
  );
}

function isDocStub(value: unknown): value is InsuranceDocStub {
  if (!value || typeof value !== "object") return false;
  const d = value as InsuranceDocStub;
  return (
    typeof d.fileName === "string" &&
    typeof d.sizeBytes === "number" &&
    typeof d.mimeType === "string" &&
    typeof d.notedAt === "string"
  );
}

function isInquiryShape(value: unknown): value is InsuranceInquiry {
  if (!value || typeof value !== "object") return false;
  const r = value as InsuranceInquiry;
  if (
    typeof r.id !== "string" ||
    typeof r.patientKey !== "string" ||
    typeof r.patientLabel !== "string" ||
    (r.source !== "account" && r.source !== "funnel") ||
    !r.details ||
    typeof r.details !== "object" ||
    r.payerVerified !== false ||
    !isStatus(r.status) ||
    typeof r.statusLabel !== "string" ||
    !Array.isArray(r.documents) ||
    typeof r.adminNote !== "string" ||
    r.operational !== false ||
    typeof r.createdAt !== "string" ||
    typeof r.updatedAt !== "string"
  ) {
    return false;
  }
  const d = r.details;
  if (
    typeof d.carrier !== "string" ||
    typeof d.memberId !== "string" ||
    typeof d.groupNumber !== "string" ||
    typeof d.subscriberName !== "string" ||
    typeof d.planType !== "string" ||
    typeof d.relationship !== "string" ||
    typeof d.notes !== "string"
  ) {
    return false;
  }
  // Reject any corrupted rows that somehow claim verification or invent approvals.
  if (/approv|cover(ed|age)|eligib|authoriz|verified\s+payer/i.test(r.statusLabel)) {
    return false;
  }
  return r.documents.every(isDocStub);
}

export function loadInsuranceStore(): InsuranceStore {
  try {
    const raw = localStorage.getItem(INSURANCE_STORE_KEY);
    if (!raw) return { ...EMPTY_STORE, inquiries: [] };
    const parsed = JSON.parse(raw) as Partial<InsuranceStore>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.inquiries)) {
      return { ...EMPTY_STORE, inquiries: [] };
    }
    return { version: 1, inquiries: parsed.inquiries.filter(isInquiryShape) };
  } catch {
    return { ...EMPTY_STORE, inquiries: [] };
  }
}

export function saveInsuranceStore(store: InsuranceStore): void {
  localStorage.setItem(INSURANCE_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("ro-insurance-store-changed"));
}

export function subscribeInsuranceStore(onChange: () => void): () => void {
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === INSURANCE_STORE_KEY || e.key === null) onChange();
  };
  window.addEventListener("ro-insurance-store-changed", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("ro-insurance-store-changed", handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function listInquiriesForPatient(patientKey: string): InsuranceInquiry[] {
  const key = patientKey.trim().toLowerCase();
  return loadInsuranceStore()
    .inquiries.filter((i) => i.patientKey.toLowerCase() === key)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listAllInquiries(): InsuranceInquiry[] {
  return [...loadInsuranceStore().inquiries].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getInquiry(id: string): InsuranceInquiry | undefined {
  return loadInsuranceStore().inquiries.find((i) => i.id === id);
}

export type CreateInquiryInput = {
  patientKey: string;
  patientLabel: string;
  source: "account" | "funnel";
  details: InsuranceDetails;
  document?: InsuranceDocStub;
};

export function createInsuranceInquiry(input: CreateInquiryInput): InsuranceInquiry {
  const now = nowIso();
  const status: InsuranceReviewStatus = "submitted";
  const inquiry: InsuranceInquiry = {
    id: newId("ins"),
    patientKey: input.patientKey.trim(),
    patientLabel: input.patientLabel.trim() || input.patientKey.trim(),
    source: input.source,
    details: {
      carrier: input.details.carrier.trim(),
      memberId: input.details.memberId.trim(),
      groupNumber: input.details.groupNumber.trim(),
      subscriberName: input.details.subscriberName.trim(),
      planType: input.details.planType.trim(),
      relationship: input.details.relationship.trim(),
      notes: input.details.notes.trim(),
    },
    payerVerified: false,
    status,
    statusLabel: INSURANCE_STATUS_LABEL[status],
    documents: input.document ? [input.document] : [],
    adminNote: "",
    operational: false,
    createdAt: now,
    updatedAt: now,
  };
  const store = loadInsuranceStore();
  saveInsuranceStore({ version: 1, inquiries: [inquiry, ...store.inquiries] });
  return inquiry;
}

export function updateInquiryDetails(
  id: string,
  details: InsuranceDetails,
): InsuranceInquiry | undefined {
  const store = loadInsuranceStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx < 0) return undefined;
  const existing = store.inquiries[idx];
  const updated: InsuranceInquiry = {
    ...existing,
    details: {
      carrier: details.carrier.trim(),
      memberId: details.memberId.trim(),
      groupNumber: details.groupNumber.trim(),
      subscriberName: details.subscriberName.trim(),
      planType: details.planType.trim(),
      relationship: details.relationship.trim(),
      notes: details.notes.trim(),
    },
    payerVerified: false,
    operational: false,
    updatedAt: nowIso(),
  };
  store.inquiries[idx] = updated;
  saveInsuranceStore(store);
  return updated;
}

/**
 * Admin/demo status mutation only.
 * Refuses any attempt to set a fabricated approval-style status.
 */
export function setInquiryStatus(
  id: string,
  status: InsuranceReviewStatus,
  adminNote?: string,
): InsuranceInquiry | undefined {
  if (!isStatus(status)) return undefined;
  const store = loadInsuranceStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx < 0) return undefined;
  const existing = store.inquiries[idx];
  const updated: InsuranceInquiry = {
    ...existing,
    status,
    statusLabel: INSURANCE_STATUS_LABEL[status],
    adminNote: typeof adminNote === "string" ? adminNote.trim().slice(0, 400) : existing.adminNote,
    payerVerified: false,
    operational: false,
    updatedAt: nowIso(),
  };
  store.inquiries[idx] = updated;
  saveInsuranceStore(store);
  return updated;
}

export function addInquiryDocument(
  id: string,
  doc: InsuranceDocStub,
): InsuranceInquiry | undefined {
  const store = loadInsuranceStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx < 0) return undefined;
  const existing = store.inquiries[idx];
  const updated: InsuranceInquiry = {
    ...existing,
    documents: [...existing.documents, doc].slice(0, 8),
    updatedAt: nowIso(),
  };
  store.inquiries[idx] = updated;
  saveInsuranceStore(store);
  return updated;
}

/**
 * Build document metadata from a File, or reject with honest copy.
 * Never reads or stores file bytes.
 */
export function noteInsuranceDocStub(file: File | null | undefined):
  | { ok: true; meta: InsuranceDocStub; notice: string }
  | { ok: false; notice: string } {
  if (!file) {
    return { ok: false, notice: SAFE_INSURANCE_NOTIFY.documentRejected };
  }
  const lower = file.name.toLowerCase();
  const risky =
    /\.(dcm|dicom|hl7|fhir)$/i.test(lower) ||
    /lab[-_\s]?result|medical[-_\s]?record|phi|hipaa|prescription|chart/i.test(lower);
  if (risky) {
    return { ok: false, notice: SAFE_INSURANCE_NOTIFY.documentRejected };
  }
  return {
    ok: true,
    meta: {
      fileName: file.name.slice(0, 180),
      sizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
      notedAt: nowIso(),
    },
    notice: SAFE_INSURANCE_NOTIFY.documentNoted,
  };
}

/** Mask member ID for display — still local-only demo data. */
export function maskMemberId(memberId: string): string {
  const trimmed = memberId.trim();
  if (trimmed.length <= 4) return "••••";
  return `${"•".repeat(Math.min(trimmed.length - 4, 8))}${trimmed.slice(-4)}`;
}

export function formatInsuranceTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }) + " UTC"
    );
  } catch {
    return iso;
  }
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function emptyInsuranceDetails(): InsuranceDetails {
  return {
    carrier: "",
    memberId: "",
    groupNumber: "",
    subscriberName: "",
    planType: PLAN_TYPE_OPTIONS[0],
    relationship: RELATIONSHIP_OPTIONS[0],
    notes: "",
  };
}
