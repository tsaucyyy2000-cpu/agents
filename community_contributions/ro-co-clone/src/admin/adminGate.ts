/** sessionStorage flag while this tab has unlocked the demo admin. */
export const ADMIN_GATE_STORAGE_KEY = "ro-clone-admin-unlocked-v1";

/**
 * Fallback passphrase when `VITE_ADMIN_GATE` is unset.
 * Bundled into the client — local / demo only, not production auth.
 */
export const DEMO_ADMIN_GATE_PASSPHRASE = "demo-admin";

/** Passphrase expected by the demo gate (env override or documented DEMO fallback). */
export function expectedAdminPassphrase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_GATE;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return DEMO_ADMIN_GATE_PASSPHRASE;
}

export function isAdminUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(ADMIN_GATE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Returns true when the passphrase matches and unlock is persisted for this tab. */
export function unlockAdmin(passphrase: string): boolean {
  if (passphrase !== expectedAdminPassphrase()) return false;
  try {
    window.sessionStorage.setItem(ADMIN_GATE_STORAGE_KEY, "1");
  } catch {
    // Still treat as unlocked for this render if storage is unavailable.
  }
  return true;
}

export function lockAdmin(): void {
  try {
    window.sessionStorage.removeItem(ADMIN_GATE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
