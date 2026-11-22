export type IndexingMode = "index,follow" | "noindex,nofollow";

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  careArea?: "weight" | "sexual-health" | "hair" | "skin";
  sitemap?: boolean;
  robots?: IndexingMode;
  schemaType?: "WebPage" | "MedicalWebPage" | "AboutPage" | "FAQPage" | "CollectionPage";
}

/**
 * Demo stays noindexed until launch approval.
 * Flip DEFAULT_ROBOTS only after legal/clinical review.
 */
export const DEFAULT_ROBOTS: IndexingMode = "noindex,nofollow";

export const SITE_NAME = "ro clone";

/** Canonical origin (override with VITE_SITE_ORIGIN). */
export function siteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_ORIGIN;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "http://127.0.0.1:5173";
}

export const PUBLIC_ROUTES: RouteMeta[] = [
  {
    path: "/",
    title: "Home · online care paths (demo)",
    description:
      "Demo telehealth marketing home: pick a care area, review how the visit works, start a fictional intake. Not affiliated with Ro.",
    schemaType: "WebPage",
  },
  {
    path: "/weight-loss",
    title: "Weight care pathways (demo)",
    description:
      "Demo weight-care landing: how the visit works, option cards without verified prices, safety stub. Not medical advice.",
    careArea: "weight",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/sexual-health",
    title: "Sexual health care (demo)",
    description:
      "Demo sexual-health landing with format comparisons and a fictional visit CTA. Placeholder copy only.",
    careArea: "sexual-health",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/hair",
    title: "Hair care plans (demo)",
    description:
      "Demo hair-care landing for thinning and density goals. Structural recreation—no clinical claims.",
    careArea: "hair",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/skin",
    title: "Skin care routines (demo)",
    description:
      "Demo skin-care landing for texture, tone, and breakout goals. Placeholder education only.",
    careArea: "skin",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/visit",
    title: "Start a demo visit",
    description:
      "Multi-step fictional intake: care area, state, option, confirm. Saves a local lead only—no clinic.",
    schemaType: "WebPage",
  },
  {
    path: "/how-it-works",
    title: "How the demo visit works",
    description: "Four-step explainer for the local telehealth marketing demo flow.",
    schemaType: "WebPage",
  },
  {
    path: "/insurance-check",
    title: "Coverage check prototype",
    description:
      "Local insurance pathway metaphor. No payer APIs—enter placeholders to unlock a fake result.",
    schemaType: "WebPage",
  },
  {
    path: "/checkout",
    title: "Plan review (demo)",
    description:
      "Confirm a sample membership cadence and save a local lead. No payments or verified prices.",
    schemaType: "WebPage",
  },
  {
    path: "/guides",
    title: "Health guides (demo)",
    description: "Education tiles for discovery layout review. Original placeholder summaries only.",
    schemaType: "CollectionPage",
  },
  {
    path: "/about",
    title: "About this clone",
    description:
      "Local Vite + React recreation of a telehealth marketing funnel. Not affiliated with Ro.",
    schemaType: "AboutPage",
  },
  {
    path: "/help",
    title: "Help center (demo)",
    description: "Demo help paths for reviewing the clone routes and flows.",
    schemaType: "WebPage",
  },
  {
    path: "/safety",
    title: "Safety info (demo stub)",
    description:
      "Placeholder safety page. This demo is not medical advice and does not prescribe medication.",
    schemaType: "WebPage",
  },
  {
    path: "/privacy",
    title: "Privacy (demo)",
    description: "Demo privacy note: visit leads and content edits stay in browser localStorage.",
    schemaType: "WebPage",
  },
  {
    path: "/terms",
    title: "Terms (demo)",
    description:
      "Demo terms: unofficial recreation for local review. Do not use for real care decisions.",
    schemaType: "WebPage",
  },
  {
    path: "/cookie-policy",
    title: "Cookie policy (demo)",
    description: "Demo cookie policy stub for the local telehealth marketing preview.",
    schemaType: "WebPage",
  },
  {
    path: "/privacy-choices",
    title: "Privacy choices (demo)",
    description: "Demo privacy-choices stub. Preferences stay in this browser only.",
    schemaType: "WebPage",
  },
  {
    path: "/consumer-health-privacy",
    title: "Consumer health privacy (demo)",
    description: "Demo consumer-health privacy stub. Not a live notice.",
    schemaType: "WebPage",
  },
  {
    path: "/disclosure",
    title: "Disclosure (demo)",
    description: "Demo disclosure stub for the local marketing preview banner.",
    schemaType: "WebPage",
  },
];

/** Known dynamic public paths included in sitemap.xml */
export const SITEMAP_DYNAMIC_PATHS = [
  "/guides/g1",
  "/guides/g2",
  "/guides/g3",
  "/guides/g4",
  "/products/weekly-glp1",
  "/products/oral-option",
  "/products/dual-action",
  "/products/daily-support",
  "/products/density-kit",
  "/products/topical-foam",
  "/products/skin-routine",
  "/products/calm-serum",
];

const byPath = new Map(PUBLIC_ROUTES.map((route) => [route.path, route]));

export function metaForPathname(pathname: string): RouteMeta {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if (byPath.has(normalized)) {
    const base = byPath.get(normalized);
    if (base) return { ...base, robots: base.robots ?? DEFAULT_ROBOTS, sitemap: base.sitemap !== false };
  }

  if (normalized.startsWith("/guides/")) {
    return {
      path: normalized,
      title: "Guide · health education (demo)",
      description: "Demo health guide article with original placeholder copy and a visit CTA.",
      schemaType: "MedicalWebPage",
      robots: DEFAULT_ROBOTS,
      sitemap: true,
    };
  }

  if (normalized.startsWith("/products/")) {
    return {
      path: normalized,
      title: "Product detail (demo)",
      description:
        "Demo product card with visit and plan-review CTAs. Pricing withheld until verified.",
      schemaType: "WebPage",
      robots: DEFAULT_ROBOTS,
      sitemap: true,
    };
  }

  if (normalized.startsWith("/admin")) {
    return {
      path: normalized,
      title: "Admin · local content tools",
      description: "Operator tools for the local demo. Not linked from customer chrome.",
      robots: "noindex,nofollow",
      sitemap: false,
      schemaType: "WebPage",
    };
  }

  return {
    path: normalized,
    title: "Page not found · redirected home",
    description: "Unknown path in the local demo; soft-redirected to home.",
    robots: "noindex,nofollow",
    sitemap: false,
    schemaType: "WebPage",
  };
}

export function absoluteUrl(path: string): string {
  const origin = siteOrigin();
  if (path === "/") return `${origin}/`;
  return origin + path;
}
