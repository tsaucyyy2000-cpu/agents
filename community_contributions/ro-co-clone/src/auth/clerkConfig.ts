/**
 * Shared Clerk env helpers for customer + admin auth.
 *
 * Publishable key ships in the Vite client bundle. Never put CLERK_SECRET_KEY here.
 */

/** Clerk publishable key from env, or empty when unset / whitespace. */
export function clerkPublishableKey(): string {
  const raw = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (typeof raw !== "string") return "";
  return raw.trim();
}

export function isClerkConfigured(): boolean {
  return clerkPublishableKey().length > 0;
}

/** Appearance aligned to site tokens (teal / Manrope / plaster — not purple defaults). */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#6bb8b3",
    colorText: "#1a1a1a",
    colorTextSecondary: "#7f7f7f",
    colorBackground: "#ffffff",
    colorInputBackground: "#f6f6f4",
    colorInputText: "#1a1a1a",
    colorDanger: "#d70f0f",
    borderRadius: "12px",
    fontFamily: '"Manrope", "Avenir Next", "Segoe UI", sans-serif',
    fontFamilyButtons: '"Manrope", "Avenir Next", "Segoe UI", sans-serif',
  },
  elements: {
    rootBox: "auth-clerk-root",
    card: "auth-clerk-card",
    headerTitle: "auth-clerk-title",
    headerSubtitle: "auth-clerk-subtitle",
    socialButtonsBlockButton: "auth-clerk-social",
    formButtonPrimary: "auth-clerk-primary",
    footerActionLink: "auth-clerk-footer-link",
  },
} as const;
