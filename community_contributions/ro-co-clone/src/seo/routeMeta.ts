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
 * Index public pages only when VITE_SITE_ORIGIN is a real public host.
 * Localhost / 127.0.0.1 / unset stay noindex so previews are not crawled.
 */
export function defaultRobots(): IndexingMode {
  const fromEnv = import.meta.env.VITE_SITE_ORIGIN;
  if (typeof fromEnv !== "string" || !fromEnv.trim()) return "noindex,nofollow";
  try {
    const host = new URL(fromEnv.trim()).hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      host.endsWith(".localhost")
    ) {
      return "noindex,nofollow";
    }
    return "index,follow";
  } catch {
    return "noindex,nofollow";
  }
}

/** Resolved once per module load from build-time env. */
export const DEFAULT_ROBOTS: IndexingMode = defaultRobots();

export const SITE_NAME = "ro";

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
    title: "Home · online care paths",
    description:
      "Telehealth marketing home: pick a care area, review how the visit works, start an online intake. Not affiliated with Ro.",
    schemaType: "WebPage",
  },
  {
    path: "/weight-loss",
    title: "Weight care pathways",
    description:
      "Weight-care landing with how-it-works, pathway cards, options, FAQ, and GLP-1 ISI stub links. No verified prices or outcome claims.",
    careArea: "weight",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/sexual-health",
    title: "Sexual health care",
    description:
      "Sexual-health landing: format pathways, quiz CTA, FAQ, and safety hub bridges. Education only—no invented drug labeling.",
    careArea: "sexual-health",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/hair",
    title: "Hair care plans",
    description:
      "Hair-care landing for thinning and density goals: pathways, options, FAQ, and minoxidil ISI stub links. No clinical claims.",
    careArea: "hair",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/skin",
    title: "Skin care routines",
    description:
      "Skin-care landing for texture, tone, and breakout goals: pathways, options, FAQ, and safety hub bridges. Placeholder education only.",
    careArea: "skin",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/visit",
    title: "Start a visit",
    description:
      "Multi-step intake: care area, state, option, confirm. Saves a local lead only until a clinic backend is connected.",
    schemaType: "WebPage",
  },
  {
    path: "/quiz/weight-loss",
    title: "Weight care quiz",
    description:
      "Short versioned-consent quiz for weight care that continues into the shared visit funnel.",
    careArea: "weight",
    schemaType: "WebPage",
  },
  {
    path: "/quiz/hair",
    title: "Hair care quiz",
    description: "Short quiz for hair density goals before the shared visit intake.",
    careArea: "hair",
    schemaType: "WebPage",
  },
  {
    path: "/quiz/sexual-health",
    title: "Sexual health quiz",
    description: "Short quiz for sexual-health goals. No invented drug ISI attached.",
    careArea: "sexual-health",
    schemaType: "WebPage",
  },
  {
    path: "/quiz/skin",
    title: "Skin care quiz",
    description: "Short quiz for skin goals before the shared visit intake.",
    careArea: "skin",
    schemaType: "WebPage",
  },
  {
    path: "/isi/glp1",
    title: "GLP-1 ISI stub",
    description:
      "Illustrative GLP-1 important safety information stub for layout review. Not FDA labeling.",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/isi/minoxidil",
    title: "Minoxidil ISI stub",
    description:
      "Illustrative minoxidil important safety information stub for layout review. Not FDA labeling.",
    schemaType: "MedicalWebPage",
  },
  {
    path: "/how-it-works",
    title: "How care works",
    description:
      "Funnel explainer: care-area quiz → shared visit → optional coverage check → plan review.",
    schemaType: "WebPage",
  },
  {
    path: "/insurance-check",
    title: "Coverage check",
    description:
      "Local insurance pathway. No payer APIs—enter placeholders to unlock a sample result.",
    schemaType: "WebPage",
  },
  {
    path: "/checkout",
    title: "Plan review",
    description:
      "Confirm a sample membership cadence and save a local lead. No payments or verified prices.",
    schemaType: "WebPage",
  },
  {
    path: "/guides",
    title: "Health guides",
    description:
      "Education tiles bridging to care landings, matching quizzes, how-it-works, and Help. Original summaries only—no verified prices.",
    schemaType: "CollectionPage",
  },
  {
    path: "/about",
    title: "About",
    description:
      "About this telehealth marketing site — not affiliated with Ro. Bridges to Help, how-it-works, and care finder.",
    schemaType: "AboutPage",
  },
  {
    path: "/help",
    title: "Help center",
    description:
      "Help hub: care quizzes, visit funnel, safety stubs, guides, and policy links.",
    schemaType: "FAQPage",
  },
  {
    path: "/safety",
    title: "Safety info",
    description:
      "Placeholder safety page. This site is not medical advice and does not prescribe medication.",
    schemaType: "WebPage",
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "Privacy note: visit leads and content edits stay in browser localStorage until a backend is connected.",
    schemaType: "WebPage",
  },
  {
    path: "/terms",
    title: "Terms",
    description:
      "Terms: unofficial recreation for review. Do not use for real care decisions until counsel-reviewed.",
    schemaType: "WebPage",
  },
  {
    path: "/cookie-policy",
    title: "Cookie policy",
    description: "Cookie policy for this telehealth marketing site.",
    schemaType: "WebPage",
  },
  {
    path: "/privacy-choices",
    title: "Privacy choices",
    description:
      "Privacy-choices page. Preferences stay in this browser until a backend is connected.",
    schemaType: "WebPage",
  },
  {
    path: "/consumer-health-privacy",
    title: "Consumer health privacy",
    description: "Consumer-health privacy stub. Replace with a live notice before launch.",
    schemaType: "WebPage",
  },
  {
    path: "/disclosure",
    title: "Disclosure",
    description: "Disclosure stub for the marketing site.",
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
      title: "Guide · health education",
      description: "Health guide article with original placeholder copy and a visit CTA.",
      schemaType: "MedicalWebPage",
      robots: DEFAULT_ROBOTS,
      sitemap: true,
    };
  }

  if (normalized.startsWith("/products/")) {
    return {
      path: normalized,
      title: "Product detail",
      description:
        "Catalog card with related care quiz primary, care landing / how-it-works / Help bridges. Pricing withheld until verified.",
      schemaType: "WebPage",
      robots: DEFAULT_ROBOTS,
      sitemap: true,
    };
  }

  if (normalized.startsWith("/quiz/")) {
    return {
      path: normalized,
      title: "Care quiz",
      description: "Versioned consent quiz that continues into the shared visit funnel.",
      schemaType: "WebPage",
      robots: DEFAULT_ROBOTS,
      sitemap: true,
    };
  }

  if (normalized.startsWith("/isi/")) {
    return {
      path: normalized,
      title: "ISI stub",
      description:
        "Illustrative important safety information stub. Re-verify before launch — not FDA labeling.",
      schemaType: "MedicalWebPage",
      robots: DEFAULT_ROBOTS,
      sitemap: true,
    };
  }

  if (normalized.startsWith("/admin")) {
    return {
      path: normalized,
      title: "Admin · content tools",
      description: "Operator tools. Not linked from customer chrome.",
      robots: "noindex,nofollow",
      sitemap: false,
      schemaType: "WebPage",
    };
  }

  if (
    normalized === "/sign-in" ||
    normalized.startsWith("/sign-in/") ||
    normalized === "/sign-up" ||
    normalized.startsWith("/sign-up/") ||
    normalized === "/account" ||
    normalized.startsWith("/account/")
  ) {
    const accountSection = normalized.startsWith("/account/")
      ? normalized.slice("/account/".length).split("/")[0]
      : normalized === "/account"
        ? "overview"
        : "";
    const accountTitles: Record<string, string> = {
      overview: "Account overview",
      care: "My care",
      orders: "Orders",
      membership: "Membership",
      progress: "Progress",
      documents: "Documents",
      settings: "Account settings",
    };
    const kind = normalized.startsWith("/sign-up")
      ? "Sign up"
      : normalized.startsWith("/sign-in")
        ? "Sign in"
        : accountTitles[accountSection] || "Account";
    return {
      path: normalized,
      title: `${kind} · customer`,
      description:
        "Patient dashboard shell for this marketing SPA. Honest empty states; not a production PHI, pharmacy, or billing backend.",
      robots: "noindex,nofollow",
      sitemap: false,
      schemaType: "WebPage",
    };
  }

  return {
    path: normalized,
    title: "Page not found",
    description: "Unknown path. Soft 404 with links home and to care areas—not indexed.",
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
