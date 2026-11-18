export type CareArea = "weight" | "sexual-health" | "hair" | "skin";

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
}

export interface Guide {
  id: string;
  title: string;
  read: string;
  imageId: string;
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

export interface CategoryPage {
  slug: CareArea;
  path: string;
  eyebrow: string;
  title: string;
  lede: string;
  ctaLabel: string;
  heroImageId: string;
  bullets: string[];
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  membershipFirstMonth: string;
  membershipOngoing: string;
  memberCountLabel: string;
  satisfactionLabel: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  goal: string;
  state: string;
  notes: string;
  status: "new" | "reviewed" | "closed";
}

export interface SiteContent {
  version: number;
  updatedAt: string;
  settings: SiteSettings;
  nav: NavLink[];
  heroGoals: string[];
  homeSupport: string;
  categories: CategoryPage[];
  products: Product[];
  guides: Guide[];
  testimonials: Testimonial[];
  experts: Expert[];
  media: MediaAsset[];
  convenience: { title: string; copy: string }[];
  leads: Lead[];
}
