/**
 * Lab + pharmacy status shells — architecture types for future partners.
 *
 * Honesty rules (DB-45):
 * - Never invent lab result values or shipment tracking numbers.
 * - localStorage demo adapters are non-operational until a real partner is wired.
 * - Patients see “awaiting partner integration” for result / tracking surfaces.
 *
 * Future partners implement LabPartnerAdapter / PharmacyPartnerAdapter and replace
 * the LocalDemoLabAdapter / LocalDemoPharmacyAdapter used by the UI store.
 */

/** Lab pipeline: requested → ordered → specimen → result review */
export type LabPipelineStage =
  | "requested"
  | "ordered"
  | "specimen"
  | "result_review";

/** Pharmacy / fulfillment pipeline (orders tab) */
export type PharmacyPipelineStage =
  | "requested"
  | "ordered"
  | "preparing"
  | "shipped";

export type PartnerIntegrationStatus = "awaiting_partner_integration";

/**
 * Lab shell record. `resultPayload` is always null in the demo adapter —
 * real partners would populate a typed result DTO (never invent values here).
 */
export type LabShellRecord = {
  id: string;
  patientKey: string;
  patientLabel: string;
  /** Pathway metaphor label — not a CLIA panel code or real assay name. */
  panelLabel: string;
  stage: LabPipelineStage;
  /** Always null until a partner adapter returns verified results. */
  resultPayload: null;
  partnerStatus: PartnerIntegrationStatus;
  /** Demo / non-operational label for UI chips. */
  operational: false;
  createdAt: string;
  updatedAt: string;
};

/**
 * Pharmacy / order shell record. `trackingNumber` is always null —
 * never fabricate carriers or tracking IDs.
 */
export type PharmacyShellRecord = {
  id: string;
  patientKey: string;
  patientLabel: string;
  /** Care pathway metaphor — not a real Rx or NDC. */
  pathwayLabel: string;
  stage: PharmacyPipelineStage;
  /** Always null until a fulfillment partner returns a real shipment. */
  trackingNumber: null;
  partnerStatus: PartnerIntegrationStatus;
  operational: false;
  createdAt: string;
  updatedAt: string;
};

export type LabShellStore = {
  version: 1;
  labs: LabShellRecord[];
};

export type PharmacyShellStore = {
  version: 1;
  orders: PharmacyShellRecord[];
};

/**
 * Future lab partner contract. Wire a real vendor here after BAAs / CLIA rules;
 * do not invent credentials or result payloads in the SPA.
 */
export interface LabPartnerAdapter {
  readonly id: string;
  readonly label: string;
  /** Whether this adapter can fulfill real orders (demo = false). */
  readonly operational: boolean;
  listForPatient(patientKey: string): Promise<LabShellRecord[]>;
  listAll(): Promise<LabShellRecord[]>;
  /**
   * Create a status-shell request. Demo adapters stay at `requested` and never
   * attach `resultPayload`. Partner adapters may advance stages from their API.
   */
  createRequest(input: {
    patientKey: string;
    patientLabel: string;
    panelLabel: string;
  }): Promise<LabShellRecord>;
}

/**
 * Future pharmacy / fulfillment partner contract. Wire after licensing;
 * never invent tracking numbers in the client.
 */
export interface PharmacyPartnerAdapter {
  readonly id: string;
  readonly label: string;
  readonly operational: boolean;
  listForPatient(patientKey: string): Promise<PharmacyShellRecord[]>;
  listAll(): Promise<PharmacyShellRecord[]>;
  createRequest(input: {
    patientKey: string;
    patientLabel: string;
    pathwayLabel: string;
  }): Promise<PharmacyShellRecord>;
}

export const LAB_PIPELINE_STAGES: {
  id: LabPipelineStage;
  label: string;
  hint: string;
}[] = [
  { id: "requested", label: "Requested", hint: "Patient asked for a lab status shell" },
  { id: "ordered", label: "Ordered", hint: "Partner order — awaiting integration" },
  { id: "specimen", label: "Specimen", hint: "Collection / kit — awaiting partner" },
  {
    id: "result_review",
    label: "Result review",
    hint: "Results appear only when a lab partner is live — never fabricated",
  },
];

export const PHARMACY_PIPELINE_STAGES: {
  id: PharmacyPipelineStage;
  label: string;
  hint: string;
}[] = [
  { id: "requested", label: "Requested", hint: "Patient asked for an order status shell" },
  { id: "ordered", label: "Ordered", hint: "Partner Rx order — awaiting integration" },
  { id: "preparing", label: "Preparing", hint: "Dispense / pack — awaiting partner" },
  {
    id: "shipped",
    label: "Shipped",
    hint: "Tracking appears only when fulfillment is live — never fabricated",
  },
];

export const LAB_STAGE_LABEL: Record<LabPipelineStage, string> = Object.fromEntries(
  LAB_PIPELINE_STAGES.map((s) => [s.id, s.label]),
) as Record<LabPipelineStage, string>;

export const PHARMACY_STAGE_LABEL: Record<PharmacyPipelineStage, string> = Object.fromEntries(
  PHARMACY_PIPELINE_STAGES.map((s) => [s.id, s.label]),
) as Record<PharmacyPipelineStage, string>;

export const AWAITING_PARTNER_COPY = "Awaiting partner integration" as const;

export const SAFE_LAB_PHARMACY_NOTIFY = {
  labRequested: "Lab status request saved on this device.",
  pharmacyRequested: "Order status request saved on this device.",
  partnerPending: AWAITING_PARTNER_COPY,
} as const;

/** Demo pathway options — metaphors only, not real assays / NDCs. */
export const LAB_PANEL_OPTIONS = [
  { id: "general-check", label: "General check-in panel (shell)" },
  { id: "weight-followup", label: "Weight-care follow-up (shell)" },
  { id: "hormone-metaphor", label: "Hormone pathway metaphor (shell)" },
] as const;

export const PHARMACY_PATHWAY_OPTIONS = [
  { id: "weight-plan", label: "Weight-care plan (shell)" },
  { id: "hair-plan", label: "Hair-care plan (shell)" },
  { id: "skin-plan", label: "Skin-care plan (shell)" },
  { id: "sexual-health-plan", label: "Sexual health plan (shell)" },
] as const;
