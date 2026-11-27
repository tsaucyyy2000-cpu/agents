import { ACCOUNT_NAV_KEYS } from "../i18n/carePaths";

export type AccountNavItem = {
  to: string;
  /** i18n key under the account namespace (e.g. nav.overview). */
  labelKey: string;
  /** @deprecated Prefer labelKey + t(); kept for EN fallback tooling. */
  label: string;
  end?: boolean;
};

const EN_LABELS: Record<string, string> = {
  "nav.overview": "Overview",
  "nav.care": "My care",
  "nav.appointments": "Appointments",
  "nav.labs": "Labs",
  "nav.orders": "Orders",
  "nav.insurance": "Insurance",
  "nav.membership": "Membership",
  "nav.progress": "Progress",
  "nav.documents": "Documents",
  "nav.messages": "Messages",
  "nav.settings": "Settings",
};

/** Secondary nav for the patient dashboard shell (EN labels + i18n keys). */
export const ACCOUNT_NAV: AccountNavItem[] = ACCOUNT_NAV_KEYS.map((item) => ({
  to: item.to,
  labelKey: item.key,
  label: EN_LABELS[item.key] ?? item.key,
  end: "end" in item ? item.end : undefined,
}));
