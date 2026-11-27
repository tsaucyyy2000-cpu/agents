/**
 * Placeholder membership plan catalog for the sandbox comparison UI.
 * No verified dollar amounts — PriceTag stays pending until figures are supplied.
 */

import { PENDING_PRICE, type Price } from "../utils/formatPrice";

export type MembershipCadence = "monthly" | "quarterly" | "annual";

export type MembershipPlan = {
  id: string;
  /** Placeholder marketing name — not a live SKU. */
  name: string;
  tagline: string;
  /** Care-membership inclusions (separate from medication / pharmacy costs). */
  membershipIncludes: string[];
  /** Explicitly out of membership fee — never priced here. */
  medicationNote: string;
  highlighted?: boolean;
};

export const MEMBERSHIP_CADENCES: {
  id: MembershipCadence;
  label: string;
  shortLabel: string;
}[] = [
  { id: "monthly", label: "Monthly", shortLabel: "mo" },
  { id: "quarterly", label: "Quarterly", shortLabel: "qtr" },
  { id: "annual", label: "Annual", shortLabel: "yr" },
];

/** Placeholder plan names only — not affiliated with any live billing SKU. */
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "care-essential",
    name: "Care Essential (placeholder)",
    tagline: "Baseline care-membership shell for comparison layouts.",
    membershipIncludes: [
      "Provider messaging metaphor",
      "Care journey progress placeholders",
      "Sample coverage-check handoff",
    ],
    medicationNote:
      "Medication and pharmacy costs are separate and not included in membership fees (pending verification).",
  },
  {
    id: "care-plus",
    name: "Care Plus (placeholder)",
    tagline: "Mid-tier comparison column — still sandbox-only.",
    membershipIncludes: [
      "Everything in Essential (placeholder)",
      "Priority messaging metaphor",
      "Quarterly check-in placeholder",
    ],
    medicationNote:
      "Medication and pharmacy costs remain separate from membership (TBD / pending verification).",
    highlighted: true,
  },
  {
    id: "care-complete",
    name: "Care Complete (placeholder)",
    tagline: "Highest comparison column for layout review only.",
    membershipIncludes: [
      "Everything in Plus (placeholder)",
      "Expanded education placeholders",
      "Dedicated support metaphor",
    ],
    medicationNote:
      "Membership fees do not cover medication — those costs stay TBD until verified.",
  },
];

/** Shared pending membership price — amount always null. */
export const MEMBERSHIP_PENDING_PRICE: Price = {
  ...PENDING_PRICE,
  unit: "membership",
  note: "Membership fee TBD · separate from medication",
};

export function getMembershipPlan(planId: string | null | undefined): MembershipPlan | undefined {
  if (!planId) return undefined;
  return MEMBERSHIP_PLANS.find((plan) => plan.id === planId);
}

export function isMembershipCadence(value: string | null | undefined): value is MembershipCadence {
  return value === "monthly" || value === "quarterly" || value === "annual";
}
