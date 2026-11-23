/**
 * Client-side admin email allowlist.
 *
 * Clerk authenticates the user; this list decides who may open `/admin/*`.
 * The publishable key + allowlist ship in the client bundle — enough to stop
 * casual open access, not a substitute for a server that holds CMS/leads data.
 */

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

/** Clerk publishable key from env, or empty when unset / whitespace. */
export function clerkPublishableKey(): string {
  const raw = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (typeof raw !== "string") return "";
  return raw.trim();
}

export function isClerkConfigured(): boolean {
  return clerkPublishableKey().length > 0;
}

export function isAdminAllowlistConfigured(): boolean {
  return adminEmailAllowlist().length > 0;
}
