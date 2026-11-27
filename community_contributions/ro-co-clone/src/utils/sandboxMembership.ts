/**
 * Sandbox membership subscriptions — localStorage only.
 * Explicitly simulated: no payment processor, no verified prices, no live billing.
 */

import type { MembershipCadence } from "../data/membershipPlans";

export const SANDBOX_MEMBERSHIPS_KEY = "ro-clone-sandbox-memberships-v1";

export type SandboxBillingProfile = {
  fullName: string;
  email: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
};

export type SandboxMembershipRecord = {
  id: string;
  planId: string;
  planName: string;
  cadence: MembershipCadence;
  billingProfile: SandboxBillingProfile;
  /** ISO-8601 timestamp for audit-friendly local demos. */
  createdAt: string;
  /** Always sandbox — never implies a real charge. */
  status: "sandbox-simulated";
  confirmationLabel: "Sandbox / simulated — no payment processed";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseProfile(raw: unknown): SandboxBillingProfile | null {
  if (!isRecord(raw)) return null;
  const fullName = typeof raw.fullName === "string" ? raw.fullName : "";
  const email = typeof raw.email === "string" ? raw.email : "";
  const addressLine1 = typeof raw.addressLine1 === "string" ? raw.addressLine1 : "";
  const city = typeof raw.city === "string" ? raw.city : "";
  const region = typeof raw.region === "string" ? raw.region : "";
  const postalCode = typeof raw.postalCode === "string" ? raw.postalCode : "";
  if (!fullName || !email) return null;
  return { fullName, email, addressLine1, city, region, postalCode };
}

function parseRecord(raw: unknown): SandboxMembershipRecord | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : "";
  const planId = typeof raw.planId === "string" ? raw.planId : "";
  const planName = typeof raw.planName === "string" ? raw.planName : "";
  const cadence = raw.cadence;
  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : "";
  const billingProfile = parseProfile(raw.billingProfile);
  if (
    !id ||
    !planId ||
    !planName ||
    !createdAt ||
    !billingProfile ||
    (cadence !== "monthly" && cadence !== "quarterly" && cadence !== "annual")
  ) {
    return null;
  }
  return {
    id,
    planId,
    planName,
    cadence,
    billingProfile,
    createdAt,
    status: "sandbox-simulated",
    confirmationLabel: "Sandbox / simulated — no payment processed",
  };
}

export function loadSandboxMemberships(): SandboxMembershipRecord[] {
  try {
    const raw = localStorage.getItem(SANDBOX_MEMBERSHIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseRecord)
      .filter((item): item is SandboxMembershipRecord => item !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function saveSandboxMembership(
  input: Omit<SandboxMembershipRecord, "id" | "createdAt" | "status" | "confirmationLabel">,
): SandboxMembershipRecord {
  const record: SandboxMembershipRecord = {
    ...input,
    id: `sandbox-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "sandbox-simulated",
    confirmationLabel: "Sandbox / simulated — no payment processed",
  };
  const next = [record, ...loadSandboxMemberships()];
  localStorage.setItem(SANDBOX_MEMBERSHIPS_KEY, JSON.stringify(next));
  return record;
}

export function clearSandboxMemberships(): void {
  localStorage.removeItem(SANDBOX_MEMBERSHIPS_KEY);
}

/** Format an ISO timestamp for account / confirmation UI (UTC, audit-friendly). */
export function formatSandboxTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
  return `${formatted} UTC`;
}
