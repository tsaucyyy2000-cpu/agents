/** Map CMS / route care paths to nav.care.* translation keys. */
const CARE_PATH_KEYS: Record<string, string> = {
  "/weight-loss": "care.weightLoss",
  "/sexual-health": "care.sexualHealth",
  "/hair": "care.hair",
  "/skin": "care.skin",
};

export function careNavKey(path: string): string | null {
  return CARE_PATH_KEYS[path] ?? null;
}

export const FEATURED_LINK_KEYS = [
  { to: "/how-it-works", key: "featuredLinks.howItWorks" },
  { to: "/guides", key: "featuredLinks.guides" },
  { to: "/help", key: "featuredLinks.help" },
  { to: "/#find-care", key: "featuredLinks.findCare" },
] as const;

export const ACCOUNT_NAV_KEYS = [
  { to: "/account", key: "nav.overview", end: true },
  { to: "/account/care", key: "nav.care" },
  { to: "/account/appointments", key: "nav.appointments" },
  { to: "/account/labs", key: "nav.labs" },
  { to: "/account/orders", key: "nav.orders" },
  { to: "/account/insurance", key: "nav.insurance" },
  { to: "/account/membership", key: "nav.membership" },
  { to: "/account/progress", key: "nav.progress" },
  { to: "/account/documents", key: "nav.documents" },
  { to: "/account/messages", key: "nav.messages" },
  { to: "/account/settings", key: "nav.settings" },
] as const;

export const LOCALE_STORAGE_KEY = "ro-clone-locale";
export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
