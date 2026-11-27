/**
 * Browser localStorage adapters for lab + pharmacy status shells.
 * Non-operational until real partners replace LocalDemo* adapters.
 * Never writes result payloads or tracking numbers.
 */

import type {
  LabPartnerAdapter,
  LabShellRecord,
  LabShellStore,
  PharmacyPartnerAdapter,
  PharmacyShellRecord,
  PharmacyShellStore,
} from "./types";

export const LAB_STORE_KEY = "ro-clone-lab-status-v1";
export const PHARMACY_STORE_KEY = "ro-clone-pharmacy-orders-v1";

const EMPTY_LAB: LabShellStore = { version: 1, labs: [] };
const EMPTY_PHARMACY: PharmacyShellStore = { version: 1, orders: [] };

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isLabShape(value: unknown): value is LabShellRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as LabShellRecord;
  return (
    typeof r.id === "string" &&
    typeof r.patientKey === "string" &&
    typeof r.patientLabel === "string" &&
    typeof r.panelLabel === "string" &&
    (r.stage === "requested" ||
      r.stage === "ordered" ||
      r.stage === "specimen" ||
      r.stage === "result_review") &&
    r.resultPayload === null &&
    r.partnerStatus === "awaiting_partner_integration" &&
    r.operational === false &&
    typeof r.createdAt === "string" &&
    typeof r.updatedAt === "string"
  );
}

function isPharmacyShape(value: unknown): value is PharmacyShellRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as PharmacyShellRecord;
  return (
    typeof r.id === "string" &&
    typeof r.patientKey === "string" &&
    typeof r.patientLabel === "string" &&
    typeof r.pathwayLabel === "string" &&
    (r.stage === "requested" ||
      r.stage === "ordered" ||
      r.stage === "preparing" ||
      r.stage === "shipped") &&
    r.trackingNumber === null &&
    r.partnerStatus === "awaiting_partner_integration" &&
    r.operational === false &&
    typeof r.createdAt === "string" &&
    typeof r.updatedAt === "string"
  );
}

export function loadLabStore(): LabShellStore {
  try {
    const raw = localStorage.getItem(LAB_STORE_KEY);
    if (!raw) return { ...EMPTY_LAB, labs: [] };
    const parsed = JSON.parse(raw) as Partial<LabShellStore>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.labs)) {
      return { ...EMPTY_LAB, labs: [] };
    }
    // Drop any corrupted rows that somehow carry result payloads.
    return { version: 1, labs: parsed.labs.filter(isLabShape) };
  } catch {
    return { ...EMPTY_LAB, labs: [] };
  }
}

export function saveLabStore(store: LabShellStore): void {
  localStorage.setItem(LAB_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("ro-lab-store-changed"));
}

export function loadPharmacyStore(): PharmacyShellStore {
  try {
    const raw = localStorage.getItem(PHARMACY_STORE_KEY);
    if (!raw) return { ...EMPTY_PHARMACY, orders: [] };
    const parsed = JSON.parse(raw) as Partial<PharmacyShellStore>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.orders)) {
      return { ...EMPTY_PHARMACY, orders: [] };
    }
    return { version: 1, orders: parsed.orders.filter(isPharmacyShape) };
  } catch {
    return { ...EMPTY_PHARMACY, orders: [] };
  }
}

export function savePharmacyStore(store: PharmacyShellStore): void {
  localStorage.setItem(PHARMACY_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("ro-pharmacy-store-changed"));
}

export function subscribeLabStore(onChange: () => void): () => void {
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === LAB_STORE_KEY || e.key === null) onChange();
  };
  window.addEventListener("ro-lab-store-changed", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("ro-lab-store-changed", handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function subscribePharmacyStore(onChange: () => void): () => void {
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === PHARMACY_STORE_KEY || e.key === null) onChange();
  };
  window.addEventListener("ro-pharmacy-store-changed", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("ro-pharmacy-store-changed", handler);
    window.removeEventListener("storage", storageHandler);
  };
}

/** Non-operational localStorage lab adapter — never invents results. */
export const LocalDemoLabAdapter: LabPartnerAdapter = {
  id: "local-demo-lab",
  label: "Local demo lab adapter (non-operational)",
  operational: false,

  async listForPatient(patientKey: string) {
    return loadLabStore()
      .labs.filter((l) => l.patientKey === patientKey)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listAll() {
    return [...loadLabStore().labs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createRequest({ patientKey, patientLabel, panelLabel }) {
    const store = loadLabStore();
    const now = nowIso();
    const record: LabShellRecord = {
      id: newId("lab"),
      patientKey,
      patientLabel,
      panelLabel,
      stage: "requested",
      resultPayload: null,
      partnerStatus: "awaiting_partner_integration",
      operational: false,
      createdAt: now,
      updatedAt: now,
    };
    saveLabStore({ version: 1, labs: [record, ...store.labs] });
    return record;
  },
};

/** Non-operational localStorage pharmacy adapter — never invents tracking. */
export const LocalDemoPharmacyAdapter: PharmacyPartnerAdapter = {
  id: "local-demo-pharmacy",
  label: "Local demo pharmacy adapter (non-operational)",
  operational: false,

  async listForPatient(patientKey: string) {
    return loadPharmacyStore()
      .orders.filter((o) => o.patientKey === patientKey)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listAll() {
    return [...loadPharmacyStore().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createRequest({ patientKey, patientLabel, pathwayLabel }) {
    const store = loadPharmacyStore();
    const now = nowIso();
    const record: PharmacyShellRecord = {
      id: newId("rx"),
      patientKey,
      patientLabel,
      pathwayLabel,
      stage: "requested",
      trackingNumber: null,
      partnerStatus: "awaiting_partner_integration",
      operational: false,
      createdAt: now,
      updatedAt: now,
    };
    savePharmacyStore({ version: 1, orders: [record, ...store.orders] });
    return record;
  },
};

/** Active adapters — swap these when partners go live. */
export let activeLabAdapter: LabPartnerAdapter = LocalDemoLabAdapter;
export let activePharmacyAdapter: PharmacyPartnerAdapter = LocalDemoPharmacyAdapter;

export function setActiveLabAdapter(adapter: LabPartnerAdapter): void {
  activeLabAdapter = adapter;
}

export function setActivePharmacyAdapter(adapter: PharmacyPartnerAdapter): void {
  activePharmacyAdapter = adapter;
}

export function listLabsForPatient(patientKey: string): LabShellRecord[] {
  return loadLabStore()
    .labs.filter((l) => l.patientKey === patientKey)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllLabs(): LabShellRecord[] {
  return [...loadLabStore().labs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listPharmacyForPatient(patientKey: string): PharmacyShellRecord[] {
  return loadPharmacyStore()
    .orders.filter((o) => o.patientKey === patientKey)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllPharmacy(): PharmacyShellRecord[] {
  return [...loadPharmacyStore().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createLabShellRequest(input: {
  patientKey: string;
  patientLabel: string;
  panelLabel: string;
}): Promise<LabShellRecord> {
  return activeLabAdapter.createRequest(input);
}

export async function createPharmacyShellRequest(input: {
  patientKey: string;
  patientLabel: string;
  pathwayLabel: string;
}): Promise<PharmacyShellRecord> {
  return activePharmacyAdapter.createRequest(input);
}

export function formatShellTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }) + " UTC";
  } catch {
    return iso;
  }
}
