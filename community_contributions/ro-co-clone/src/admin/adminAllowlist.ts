/**
 * Client-side admin email allowlist.
 *
 * Clerk authenticates the user; this list decides who may open `/admin/*`.
 * The publishable key + allowlist ship in the client bundle — enough to stop
 * casual open access, not a substitute for a server that holds CMS/leads data.
 */

export {
  clerkPublishableKey,
  isClerkConfigured,
} from "../auth/clerkConfig";

/** Trimmed, lowercased emails from `VITE_ADMIN_EMAILS` (comma-separated). */
export function adminEmailAllowlist(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS;
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = adminEmailAllowlist();
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export function isAdminAllowlistConfigured(): boolean {
  return adminEmailAllowlist().length > 0;
}
