import type { WorkflowStatus } from "./workflowStates";

export type CareArea = "weight" | "sexual-health" | "hair" | "skin";
export type { WorkflowStatus };

/** Mirrors quizEngine.QuizDefinition — kept here to avoid a circular import. */
export type SiteQuestionnaire = {
  slug: string;
  name: string;
  careArea: CareArea;
  blurb: string;
  steps: Array<{
    id: string;
    label: string;
    help?: string;
    type: "choice" | "number" | "text";
    options?: string[];
    unit?: string;
    required?: boolean;
    min?: number;
    max?: number;
    showIf?: {
      fieldId: string;
      equals?: string;
      notEquals?: string;
      anyOf?: string[];
    };
  }>;
};

export interface NavLink {
  to: string;
  label: string;
}

export interface MediaAsset {
  id: string;
  label: string;
  src: string;
  alt: string;
  kind: "hero" | "category" | "product" | "guide" | "expert" | "other";
}

export interface Product {
  id: string;
  name: string;
  category: CareArea;
  meta: string;
  tag?: string;
  imageId: string;
  active: boolean;
  description?: string;
  priceLabel?: string;
}

export interface Guide {
  id: string;
  title: string;
  read: string;
  imageId: string;
  summary?: string;
  body?: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
}

export interface Expert {
  id: string;
  name: string;
  role: string;
  imageId: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  area?: CareArea | "general";
}

export interface HowStep {
  id: string;
  title: string;
  copy: string;
}

export interface MoreCareItem {
  id: string;
  title: string;
  copy: string;
  imageId: string;
  to: string;
}

export interface CategoryPage {
  slug: CareArea;
  path: string;
  eyebrow: string;
  title: string;
  lede: string;
  ctaLabel: string;
  heroImageId: string;
  bullets: string[];
  steps?: string[];
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  membershipFirstMonth: string;
  membershipOngoing: string;
  /** Vanity marketing stat — customer UI only when orphanPublish.vanityStats is true. */
  memberCountLabel: string;
  /** Vanity marketing stat — customer UI only when orphanPublish.vanityStats is true. */
  satisfactionLabel: string;
}

/**
 * Explicit publish switches for orphan marketing blocks.
 * All default false so staged admin drafts cannot leak without approved assets.
 */
export interface OrphanPublishFlags {
  testimonials: boolean;
  experts: boolean;
  moreCare: boolean;
  vanityStats: boolean;
}

/** Staff roles stored in the CMS allowlist (local). Not a clinical credential. */
export type StaffRole = "admin" | "provider";

/**
 * Email + role tags for staff surfaces.
 * Prefer tagging `provider` here (Admin → Settings) over inventing new secrets.
 * Optional `VITE_PROVIDER_EMAILS` remains a clean env alternative.
 */
export interface StaffAllowlistEntry {
  email: string;
  roles: StaffRole[];
}

/** Local provider annotation on a submission — not a chart note / Rx. */
export interface ProviderCaseNote {
  id: string;
  createdAt: string;
  body: string;
  authorLabel: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  goal: string;
  state: string;
  notes: string;
  /** Admin-set workflow only — never auto-set from quiz answers. */
  status: WorkflowStatus;
  source?: "visit" | "quiz";
  quizSlug?: string;
  /** Demo answers only — not a clinical record. */
  answers?: Record<string, string>;
  /** Provider portal case notes (localStorage demo only). */
  providerNotes?: ProviderCaseNote[];
}

export interface SiteContent {
  version: number;
  updatedAt: string;
  settings: SiteSettings;
  /** Publish gates for testimonials / experts / moreCare / vanity stats. */
  orphanPublish: OrphanPublishFlags;
  nav: NavLink[];
  heroGoals: string[];
  homeSupport: string;
  categories: CategoryPage[];
  products: Product[];
  guides: Guide[];
  /** Staged only until orphanPublish.testimonials — do not invent quotes. */
  testimonials: Testimonial[];
  /** Staged only until orphanPublish.experts — do not invent bios. */
  experts: Expert[];
  media: MediaAsset[];
  convenience: { title: string; copy: string }[];
  howItWorks: HowStep[];
  faqs: FaqItem[];
  /** Staged only until orphanPublish.moreCare — no faux vertical tiles. */
  moreCare: MoreCareItem[];
  /** Admin-editable quiz questionnaires (shared engine). */
  questionnaires: SiteQuestionnaire[];
  leads: Lead[];
  /**
   * Role-tagged staff emails for provider (and optional admin) access notes.
   * Live `/admin` still requires `VITE_ADMIN_EMAILS`; this list gates `/provider`
   * when `VITE_PROVIDER_EMAILS` is empty.
   */
  staffAllowlist: StaffAllowlistEntry[];
  /** Reusable non-clinical note snippets for the provider portal. */
  providerNoteTemplates: string[];
}
