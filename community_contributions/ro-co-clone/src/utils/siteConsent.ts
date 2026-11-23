import { CONSENT_VERSION } from "./intakeConsent";

export { CONSENT_VERSION };

/** Stable storage key (legacy name kept so prior decisions still apply). */
export const SITE_CONSENT_STORAGE_KEY = "ro-clone-demo-consent-v1";

export type SiteConsentState = {
  analytics: boolean;
  decided: boolean;
  /** Privacy-banner consent version; missing/old versions re-prompt. */
  version?: string;
};

export function readSiteConsent(): SiteConsentState | null {
  try {
    const raw = window.localStorage.getItem(SITE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiteConsentState;
    if (typeof parsed.decided !== "boolean") return null;
    return {
      analytics: Boolean(parsed.analytics),
      decided: parsed.decided,
      version: typeof parsed.version === "string" ? parsed.version : undefined,
    };
  } catch {
    return null;
  }
}

/** True only when the user decided on the current CONSENT_VERSION. */
export function hasCurrentSiteConsent(): boolean {
  const current = readSiteConsent();
  return Boolean(current?.decided && current.version === CONSENT_VERSION);
}

export function writeSiteConsent(next: SiteConsentState) {
  const payload: SiteConsentState = {
    analytics: next.analytics,
    decided: next.decided,
    version: CONSENT_VERSION,
  };
  window.localStorage.setItem(SITE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("ro-clone:consent", { detail: payload }));
}

export function openSiteConsent() {
  window.dispatchEvent(new Event("ro-clone:open-consent"));
}
