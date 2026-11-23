import { CONSENT_VERSION } from "./intakeConsent";

export { CONSENT_VERSION };

export const DEMO_CONSENT_STORAGE_KEY = "ro-clone-demo-consent-v1";

export type DemoConsentState = {
  analytics: boolean;
  decided: boolean;
  /** Privacy-banner consent version; missing/old versions re-prompt. */
  version?: string;
};

export function readDemoConsent(): DemoConsentState | null {
  try {
    const raw = window.localStorage.getItem(DEMO_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoConsentState;
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
export function hasCurrentDemoConsent(): boolean {
  const current = readDemoConsent();
  return Boolean(current?.decided && current.version === CONSENT_VERSION);
}

export function writeDemoConsent(next: DemoConsentState) {
  const payload: DemoConsentState = {
    analytics: next.analytics,
    decided: next.decided,
    version: CONSENT_VERSION,
  };
  window.localStorage.setItem(DEMO_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("ro-clone:consent", { detail: payload }));
}

export function openDemoConsent() {
  window.dispatchEvent(new Event("ro-clone:open-consent"));
}
