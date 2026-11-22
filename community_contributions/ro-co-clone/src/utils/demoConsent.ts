export const DEMO_CONSENT_STORAGE_KEY = "ro-clone-demo-consent-v1";

export type DemoConsentState = {
  analytics: boolean;
  decided: boolean;
};

export function readDemoConsent(): DemoConsentState | null {
  try {
    const raw = window.localStorage.getItem(DEMO_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoConsentState;
    if (typeof parsed.decided !== "boolean") return null;
    return { analytics: Boolean(parsed.analytics), decided: parsed.decided };
  } catch {
    return null;
  }
}

export function writeDemoConsent(next: DemoConsentState) {
  window.localStorage.setItem(DEMO_CONSENT_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ro-clone:consent", { detail: next }));
}

export function openDemoConsent() {
  window.dispatchEvent(new Event("ro-clone:open-consent"));
}
