/**
 * Provider portal access — Clerk + allowlist.
 *
 * Prefer tagging emails with the `provider` role in the content store
 * (Admin → Settings → Staff roles) rather than inventing new secrets.
 * Optional `VITE_PROVIDER_EMAILS` is a clean env alternative when preferred.
 *
 * Publishable key + allowlists ship in the client bundle — enough to stop
 * casual open access, not a substitute for a server that holds clinical data.
 */

export {
  clerkPublishableKey,
  isClerkConfigured,
} from "../auth/clerkConfig";

import type { StaffAllowlistEntry } from "../data/types";

/** Trimmed, lowercased emails from `VITE_PROVIDER_EMAILS` (comma-separated). */
export function providerEmailAllowlistFromEnv(): string[] {
  const raw = import.meta.env.VITE_PROVIDER_EMAILS;
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/** Emails tagged `provider` in the CMS staff allowlist. */
export function providerEmailsFromContent(staffAllowlist: StaffAllowlistEntry[]): string[] {
  return staffAllowlist
    .filter((entry) => entry.roles.includes("provider"))
    .map((entry) => entry.email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolvedProviderEmails(staffAllowlist: StaffAllowlistEntry[]): string[] {
  const merged = new Set<string>([
    ...providerEmailAllowlistFromEnv(),
    ...providerEmailsFromContent(staffAllowlist),
  ]);
  return [...merged];
}

export function isProviderAllowlistConfigured(staffAllowlist: StaffAllowlistEntry[]): boolean {
  return resolvedProviderEmails(staffAllowlist).length > 0;
}

export function isProviderEmail(
  email: string | null | undefined,
  staffAllowlist: StaffAllowlistEntry[],
): boolean {
  if (!email) return false;
  return resolvedProviderEmails(staffAllowlist).includes(email.trim().toLowerCase());
}
