/** Bump to re-prompt intake consent before quiz / visit ack. */
export const CONSENT_VERSION = "site-2026-11";

const KEY = "ro-clone-intake-consent-v1";

export type IntakeConsent = {
  version: string;
  at: string;
  treatmentSlug?: string;
};

export function readIntakeConsent(): IntakeConsent | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntakeConsent;
    if (typeof parsed.version !== "string" || typeof parsed.at !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasCurrentIntakeConsent(): boolean {
  const current = readIntakeConsent();
  return current?.version === CONSENT_VERSION;
}

export function writeIntakeConsent(treatmentSlug?: string): IntakeConsent {
  const next: IntakeConsent = {
    version: CONSENT_VERSION,
    at: new Date().toISOString(),
    treatmentSlug,
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearIntakeConsent() {
  window.localStorage.removeItem(KEY);
}
